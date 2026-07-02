import React, { useMemo, useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Banknote, CreditCard, Globe2, Percent, Receipt, CheckCircle2, Bike } from 'lucide-react';
import {
  MenuItem, Deal, Order, OrderItem, OrderItemModifier, AppliedDeal,
  EmployeeProfile, StoreLocation, SiteSettings, OrderChannel, PaymentMethod, ItemSize
} from '../types';
import { BRAND, LogoIcon } from '../brand';

interface SalesPOSProps {
  employee: EmployeeProfile;
  menuItems: MenuItem[];
  deals: Deal[];
  stores: StoreLocation[];
  orders: Order[];
  onAddOrder: (order: Order) => void;
  siteSettings: SiteSettings;
  addToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

const CHANNELS: { key: OrderChannel; label: string; icon: React.ReactNode }[] = [
  { key: 'walk_in', label: 'Walk-in', icon: <ShoppingCart className="h-3.5 w-3.5" /> },
  { key: 'phone', label: 'Phone', icon: <Receipt className="h-3.5 w-3.5" /> },
  { key: 'deliveroo', label: 'Deliveroo', icon: <Bike className="h-3.5 w-3.5" /> },
  { key: 'uber_eats', label: 'Uber Eats', icon: <Bike className="h-3.5 w-3.5" /> },
  { key: 'just_eat', label: 'Just Eat', icon: <Bike className="h-3.5 w-3.5" /> },
];

const CATEGORY_LABELS: Record<string, string> = {
  milkshakes: 'Milkshakes', smoothies: 'Smoothies', soft_serve: 'Soft Serve', slush: 'Slush', extras: 'Extras'
};

/* ------------------------------------------------------------------ */
/*  Deal engine — mirrors the calc_order_deals() logic in schema.sql   */
/* ------------------------------------------------------------------ */
export function evaluateDeals(items: OrderItem[], deals: Deal[]): AppliedDeal[] {
  const candidates: AppliedDeal[] = [];
  for (const deal of deals.filter((d) => d.active)) {
    let discount = 0;
    if (deal.type === 'bundle_price' && deal.category && deal.buyQty && deal.bundlePrice != null) {
      // expand qualifying units (base price only, extras stay charged)
      const units = items
        .filter((i) => i.category === deal.category)
        .flatMap((i) => Array(i.quantity).fill(i.unitPrice) as number[])
        .sort((a, b) => b - a);
      const groups = Math.floor(units.length / deal.buyQty);
      for (let g = 0; g < groups; g++) {
        const group = units.slice(g * deal.buyQty, (g + 1) * deal.buyQty);
        const sum = group.reduce((s, p) => s + p, 0);
        if (sum > deal.bundlePrice) discount += sum - deal.bundlePrice;
      }
    }
    if (deal.type === 'buy_x_get_y_free' && deal.category && deal.buyQty && deal.freeQty) {
      const units = items
        .filter((i) => i.category === deal.category)
        .flatMap((i) => Array(i.quantity).fill(i.unitPrice) as number[])
        .sort((a, b) => b - a); // pay for the dearest, free the cheapest
      const per = deal.buyQty + deal.freeQty;
      const groups = Math.floor(units.length / per);
      for (let g = 0; g < groups; g++) {
        const group = units.slice(g * per, (g + 1) * per);
        discount += group.slice(deal.buyQty).reduce((s, p) => s + p, 0);
      }
    }
    if (deal.type === 'percent_off_category' && deal.category && deal.percentOff) {
      const base = items.filter((i) => i.category === deal.category).reduce((s, i) => s + i.unitPrice * i.quantity, 0);
      discount = base * (deal.percentOff / 100);
    }
    if (deal.type === 'fixed_off_order' && deal.amountOff) {
      const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
      if (!deal.minOrderValue || subtotal >= deal.minOrderValue) discount = Math.min(deal.amountOff, subtotal);
    }
    if (discount > 0.004) candidates.push({ dealId: deal.id, dealName: deal.name, discount: Math.round(discount * 100) / 100 });
  }
  // Apply the single best deal for the guest (deals do not stack)
  candidates.sort((a, b) => b.discount - a.discount);
  return candidates.length ? [candidates[0]] : [];
}

export const SalesPOS: React.FC<SalesPOSProps> = ({
  employee, menuItems, deals, stores, orders, onAddOrder, siteSettings, addToast
}) => {
  const cur = siteSettings.currencySymbol || '£';
  const categories = ['milkshakes', 'smoothies', 'soft_serve', 'slush'] as const;
  const [activeCategory, setActiveCategory] = useState<string>('milkshakes');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [channel, setChannel] = useState<OrderChannel>('walk_in');
  const [payment, setPayment] = useState<PaymentMethod>('card');
  const [customerName, setCustomerName] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [modifierTarget, setModifierTarget] = useState<string | null>(null);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  const extras = useMemo(() => menuItems.filter((m) => m.category === 'extras'), [menuItems]);
  const store = stores.find((s) => s.id === employee.storeId) || stores[0];

  const addItem = (item: MenuItem, size: ItemSize) => {
    const unitPrice = size === 'large' && item.priceLarge != null ? item.priceLarge : item.price;
    setCart((prev) => {
      const match = prev.find((c) => c.menuItemId === item.id && c.size === size && c.modifiers.length === 0);
      if (match) {
        return prev.map((c) => c.id === match.id
          ? { ...c, quantity: c.quantity + 1, lineTotal: round2((unitPrice + modSum(c)) * (c.quantity + 1)) }
          : c);
      }
      const line: OrderItem = {
        id: 'li_' + Date.now() + Math.random().toString(36).slice(2, 6),
        menuItemId: item.id, name: item.name, category: item.category,
        size, unitPrice, quantity: 1, modifiers: [], lineTotal: unitPrice,
      };
      return [...prev, line];
    });
  };

  const modSum = (line: OrderItem) => line.modifiers.reduce((s, m) => s + m.price, 0);
  const round2 = (n: number) => Math.round(n * 100) / 100;

  const changeQty = (lineId: string, delta: number) => {
    setCart((prev) => prev.flatMap((c) => {
      if (c.id !== lineId) return [c];
      const q = c.quantity + delta;
      if (q <= 0) return [];
      return [{ ...c, quantity: q, lineTotal: round2((c.unitPrice + modSum(c)) * q) }];
    }));
  };

  const toggleModifier = (lineId: string, extra: MenuItem) => {
    setCart((prev) => prev.map((c) => {
      if (c.id !== lineId) return c;
      const has = c.modifiers.find((m) => m.menuItemId === extra.id);
      const modifiers: OrderItemModifier[] = has
        ? c.modifiers.filter((m) => m.menuItemId !== extra.id)
        : [...c.modifiers, { id: 'mod_' + Date.now() + Math.random().toString(36).slice(2, 5), menuItemId: extra.id, name: extra.name, price: extra.price }];
      const unitAll = c.unitPrice + modifiers.reduce((s, m) => s + m.price, 0);
      return { ...c, modifiers, lineTotal: round2(unitAll * c.quantity) };
    }));
  };

  const subtotal = round2(cart.reduce((s, c) => s + c.lineTotal, 0));
  const appliedDeals = useMemo(() => evaluateDeals(cart, deals), [cart, deals]);
  const discountTotal = round2(appliedDeals.reduce((s, d) => s + d.discount, 0));
  const total = round2(Math.max(subtotal - discountTotal, 0));
  const vatRate = siteSettings.vatRatePercent ?? 20;
  const taxAmount = round2(total * vatRate / (100 + vatRate)); // VAT-inclusive pricing
  const cash = parseFloat(cashReceived || '0');
  const change = payment === 'cash' && cash > total ? round2(cash - total) : 0;

  const todaysOrders = useMemo(() => {
    const today = new Date().toDateString();
    return orders.filter((o) => new Date(o.placedAt).toDateString() === today && o.status !== 'voided');
  }, [orders]);
  const todaysRevenue = round2(todaysOrders.filter((o) => o.status !== 'refunded').reduce((s, o) => s + o.total, 0));

  const completeOrder = () => {
    if (!cart.length) { addToast('The basket is empty — add at least one item.', 'warning'); return; }
    if (payment === 'cash' && cash < total) { addToast('Cash received is less than the order total.', 'error'); return; }
    const nextNumber = orders.reduce((mx, o) => Math.max(mx, o.orderNumber || 0), 1000) + 1;
    const order: Order = {
      id: 'ord_' + Date.now() + Math.random().toString(36).slice(2, 6),
      orderNumber: nextNumber,
      storeId: store?.id || 's1',
      storeName: store?.name || 'Milk Pop',
      channel,
      items: cart,
      appliedDeals,
      subtotal, discountTotal,
      taxRate: vatRate, taxAmount, total,
      paymentMethod: payment,
      cashReceived: payment === 'cash' ? cash : undefined,
      changeGiven: payment === 'cash' ? change : undefined,
      status: 'completed',
      customerName: customerName || undefined,
      staffId: employee.id, staffName: employee.name,
      placedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
    onAddOrder(order);
    setLastOrder(order);
    setCart([]); setCustomerName(''); setCashReceived(''); setModifierTarget(null);
    addToast(`Order #${nextNumber} completed — ${cur}${total.toFixed(2)} taken.`, 'success');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start text-left">
      {/* ------------------------------ item picker ------------------------------ */}
      <div className="xl:col-span-7 space-y-5">
        <div className="bg-white rounded-3xl border border-[#EBDECE] p-5 sm:p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-[#2E2A26]">Till — New Sale</h2>
              <p className="text-2xs text-[#2E2A26]/60 font-light">{store?.name} · served by {employee.name}</p>
            </div>
            <div className="text-right">
              <p className="text-2xs uppercase tracking-widest text-[#BD783A] font-bold">Today</p>
              <p className="text-sm font-bold text-[#2E2A26]">{todaysOrders.length} orders · {cur}{todaysRevenue.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 mb-4">
            {categories.map((c) => (
              <button key={c} onClick={() => setActiveCategory(c)}
                className={`px-4 py-2 rounded-full text-2xs uppercase tracking-wider font-bold whitespace-nowrap transition-all cursor-pointer ${activeCategory === c ? 'bg-[#BD783A] text-white' : 'bg-[#F7EFE6] text-[#2E2A26] hover:bg-[#EBDECE]'}`}>
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {menuItems.filter((m) => m.category === activeCategory).map((item) => (
              <div key={item.id} className="rounded-2xl border border-[#EBDECE] p-3 hover:border-[#BD783A]/60 transition-colors bg-white flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-[#2E2A26] leading-snug">{item.name}</p>
                  <p className="text-[10px] text-[#2E2A26]/55 font-light mt-0.5">
                    {cur}{item.price.toFixed(2)}{item.priceLarge != null ? ` / ${cur}${item.priceLarge.toFixed(2)}` : ''}
                  </p>
                </div>
                <div className="flex gap-1.5 mt-3">
                  {item.priceLarge != null ? (
                    <>
                      <button onClick={() => addItem(item, 'regular')} className="flex-1 py-1.5 rounded-lg bg-[#F7EFE6] hover:bg-[#BD783A] hover:text-white text-2xs font-bold transition-colors cursor-pointer">Reg</button>
                      <button onClick={() => addItem(item, 'large')} className="flex-1 py-1.5 rounded-lg bg-[#F7EFE6] hover:bg-[#BD783A] hover:text-white text-2xs font-bold transition-colors cursor-pointer">Lrg</button>
                    </>
                  ) : (
                    <button onClick={() => addItem(item, 'one_size')} className="flex-1 py-1.5 rounded-lg bg-[#F7EFE6] hover:bg-[#BD783A] hover:text-white text-2xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"><Plus className="h-3 w-3" /> Add</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active deals reference card */}
        <div className="bg-[#7CC0C7]/15 border border-[#7CC0C7]/50 rounded-3xl p-5">
          <h3 className="text-2xs uppercase tracking-widest font-black text-[#2E2A26] flex items-center gap-2"><Percent className="h-3.5 w-3.5 text-[#BD783A]" /> Live combos — best one applies automatically</h3>
          <div className="flex flex-wrap gap-2 mt-3">
            {deals.filter((d) => d.active).map((d) => (
              <span key={d.id} className="px-3 py-1.5 bg-white rounded-full text-2xs font-bold text-[#2E2A26] border border-[#7CC0C7]/60">
                <span className="text-[#BD783A] mr-1.5">{d.badge || '%'}</span>{d.name}
              </span>
            ))}
            {deals.filter((d) => d.active).length === 0 && (
              <span className="text-2xs text-[#2E2A26]/60 font-light">No active combos. The owner can add them in Admin Panel → Deals & Combos.</span>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------ basket ------------------------------ */}
      <div className="xl:col-span-5 bg-white rounded-3xl border border-[#EBDECE] shadow-sm p-5 sm:p-6 space-y-4 xl:sticky xl:top-24">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-[#2E2A26] flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-[#BD783A]" /> Basket</h2>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="text-2xs text-red-500 font-bold uppercase tracking-wider hover:underline cursor-pointer">Clear</button>
          )}
        </div>

        {cart.length === 0 && !lastOrder && (
          <div className="py-10 text-center">
            <LogoIcon className="h-12 w-auto mx-auto opacity-25" />
            <p className="text-2xs text-[#2E2A26]/50 font-light mt-3">Tap an item to start a new order.</p>
          </div>
        )}

        {cart.length === 0 && lastOrder && (
          <div className="py-6 text-center bg-[#F7EFE6] rounded-2xl border border-[#EBDECE]">
            <CheckCircle2 className="h-7 w-7 text-[#5FA777] mx-auto" />
            <p className="text-xs font-bold text-[#2E2A26] mt-2">Order #{lastOrder.orderNumber} complete</p>
            <p className="text-2xs text-[#2E2A26]/60 font-light">
              {cur}{lastOrder.total.toFixed(2)} · {lastOrder.paymentMethod}{lastOrder.changeGiven ? ` · change ${cur}${lastOrder.changeGiven.toFixed(2)}` : ''}
            </p>
          </div>
        )}

        {cart.map((line) => (
          <div key={line.id} className="border border-[#EBDECE] rounded-2xl p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-[#2E2A26]">{line.name}
                  {line.size !== 'one_size' && <span className="ml-1.5 text-[10px] uppercase text-[#BD783A]">{line.size}</span>}
                </p>
                {line.modifiers.length > 0 && (
                  <p className="text-[10px] text-[#2E2A26]/60 font-light">+ {line.modifiers.map((m) => m.name).join(', ')}</p>
                )}
              </div>
              <p className="text-xs font-bold text-[#2E2A26] whitespace-nowrap">{cur}{line.lineTotal.toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button onClick={() => changeQty(line.id, -1)} className="h-7 w-7 rounded-full bg-[#F7EFE6] hover:bg-[#EBDECE] flex items-center justify-center cursor-pointer"><Minus className="h-3 w-3" /></button>
                <span className="w-6 text-center text-xs font-bold">{line.quantity}</span>
                <button onClick={() => changeQty(line.id, 1)} className="h-7 w-7 rounded-full bg-[#F7EFE6] hover:bg-[#EBDECE] flex items-center justify-center cursor-pointer"><Plus className="h-3 w-3" /></button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setModifierTarget(modifierTarget === line.id ? null : line.id)}
                  className={`text-2xs font-bold uppercase tracking-wider cursor-pointer ${modifierTarget === line.id ? 'text-[#BD783A]' : 'text-[#2E2A26]/60 hover:text-[#BD783A]'}`}>
                  Extras
                </button>
                <button onClick={() => setCart((p) => p.filter((c) => c.id !== line.id))} className="text-red-400 hover:text-red-600 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            {modifierTarget === line.id && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#EBDECE]">
                {extras.map((ex) => {
                  const on = !!line.modifiers.find((m) => m.menuItemId === ex.id);
                  return (
                    <button key={ex.id} onClick={() => toggleModifier(line.id, ex)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${on ? 'bg-[#BD783A] text-white' : 'bg-[#F7EFE6] text-[#2E2A26] hover:bg-[#EBDECE]'}`}>
                      {ex.name} +{cur}{ex.price.toFixed(2)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {cart.length > 0 && (
          <>
            {/* channel + payment + customer */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap gap-1.5">
                {CHANNELS.map((c) => (
                  <button key={c.key} onClick={() => setChannel(c.key)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${channel === c.key ? 'bg-[#2E2A26] text-white' : 'bg-[#F7EFE6] text-[#2E2A26] hover:bg-[#EBDECE]'}`}>
                    {c.icon}{c.label}
                  </button>
                ))}
              </div>
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name for the cup (optional)"
                className="w-full bg-[#F7EFE6]/60 border border-[#EBDECE] rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#BD783A]" />
              <div className="grid grid-cols-3 gap-1.5">
                {([['card', 'Card', <CreditCard key="c" className="h-3.5 w-3.5" />], ['cash', 'Cash', <Banknote key="b" className="h-3.5 w-3.5" />], ['online', 'Online', <Globe2 key="o" className="h-3.5 w-3.5" />]] as [PaymentMethod, string, React.ReactNode][]).map(([key, label, icon]) => (
                  <button key={key} onClick={() => setPayment(key)}
                    className={`py-2 rounded-xl text-2xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${payment === key ? 'bg-[#7CC0C7] text-[#2E2A26]' : 'bg-[#F7EFE6] text-[#2E2A26]/70 hover:bg-[#EBDECE]'}`}>
                    {icon}{label}
                  </button>
                ))}
              </div>
              {payment === 'cash' && (
                <div className="flex items-center gap-2">
                  <input type="number" min="0" step="0.01" value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} placeholder={`Cash received (${cur})`}
                    className="flex-1 bg-[#F7EFE6]/60 border border-[#EBDECE] rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#BD783A]" />
                  <span className="text-2xs font-bold text-[#2E2A26] whitespace-nowrap">Change: {cur}{change.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* totals */}
            <div className="border-t border-[#EBDECE] pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#2E2A26]/70 font-light"><span>Subtotal</span><span>{cur}{subtotal.toFixed(2)}</span></div>
              {appliedDeals.map((d) => (
                <div key={d.dealId} className="flex justify-between text-[#5FA777] font-bold"><span>{d.dealName}</span><span>−{cur}{d.discount.toFixed(2)}</span></div>
              ))}
              <div className="flex justify-between text-[#2E2A26]/60 font-light"><span>VAT {vatRate}% (included)</span><span>{cur}{taxAmount.toFixed(2)}</span></div>
              <div className="flex justify-between text-base font-black text-[#2E2A26] pt-1"><span>Total</span><span>{cur}{total.toFixed(2)}</span></div>
            </div>

            <button onClick={completeOrder}
              className="w-full py-4 bg-[#BD783A] hover:bg-[#A5642B] text-white rounded-2xl text-xs uppercase tracking-widest font-black transition-colors cursor-pointer shadow-md">
              Complete Sale — {cur}{total.toFixed(2)}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
