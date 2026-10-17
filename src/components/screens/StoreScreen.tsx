import React, { useState } from 'react';
import { ShoppingBag, X, Check, Tag, ShieldCheck, Download, Printer } from 'lucide-react';
import { useLeague } from '../../context/LeagueContext';
import { HalftoneOverlay } from '../common/HalftoneOverlay';
import { Header } from '../common/Header';
import { RoundButton } from '../common/RoundButton';
import { BigActionButton } from '../common/BigActionButton';
import { StoreProduct, OrderReceipt } from '../../types/league';

export const StoreScreen: React.FC = () => {
  const {
    tenant,
    products,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    checkoutOrder,
    lastReceipt,
    playHapticFeedback,
  } = useLeague();

  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [discountApplied, setDiscountApplied] = useState<string | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<OrderReceipt | null>(null);

  const totalCartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartSubtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handleOpenProduct = (product: StoreProduct) => {
    setSelectedProduct(product);
    setSelectedSize(product.variants.sizes[0]);
    setSelectedColor(product.variants.colors[0]);
    playHapticFeedback();
  };

  const handleAddToCartModal = () => {
    if (!selectedProduct) return;
    addToCart(selectedProduct, selectedSize, selectedColor, 1);
    setSelectedProduct(null);
    setIsCartOpen(true);
    playHapticFeedback();
  };

  const handleApplyDiscount = () => {
    if (discountCode.trim().toUpperCase() === 'LEAGUE10') {
      setDiscountApplied('10% VIP Discount Applied');
    } else if (discountCode.trim().toUpperCase() === 'CHAMPION20') {
      setDiscountApplied('20% Champions Club Discount Applied');
    } else {
      setDiscountApplied('Invalid Code');
    }
    playHapticFeedback();
  };

  const handleExecuteCheckout = (method: string) => {
    const receipt = checkoutOrder(method, discountCode);
    setActiveReceipt(receipt);
    setIsCartOpen(false);
  };

  return (
    <div className="relative min-h-screen pb-24 bg-neutral-50 text-[#0E0E12] select-none">
      {/* Lime Header */}
      <div
        style={{ backgroundColor: tenant.colors.primary }}
        className="relative pt-2 pb-6 px-4 rounded-b-[36px] shadow-sm text-black overflow-hidden"
      >
        <HalftoneOverlay variant="lime" opacity={0.35} />
        <Header variant="lime" title="CLUB FAN STORE" />

        <div className="relative z-10 flex items-center justify-between mt-3 px-1">
          <div>
            <div className="font-condensed text-5xl font-black uppercase leading-none">
              MERCH & GEAR
            </div>
            <div className="text-xs uppercase font-bold text-black/70 mt-1">
              OFFICIAL SQUAD KITS & FAN WEAR
            </div>
          </div>

          <RoundButton
            size="lg"
            variant="dark"
            onClick={() => setIsCartOpen(true)}
            ariaLabel="Open Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-6 h-6 text-[#C8F135]" />
              {totalCartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#F0503C] text-white text-[10px] font-black flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </div>
          </RoundButton>
        </div>
      </div>

      {/* Catalogue Tinted Tiles */}
      <div className="px-4 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((prod) => (
            <div
              key={prod.id}
              onClick={() => handleOpenProduct(prod)}
              className="btn-press flex flex-col justify-between p-5 rounded-3xl bg-white border border-neutral-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden relative"
            >
              {/* Product Badge */}
              <div className="flex items-center justify-between mb-3">
                <span
                  style={{ backgroundColor: prod.bgTint }}
                  className="px-2.5 py-1 rounded-full text-black font-condensed text-xs font-black uppercase tracking-wider"
                >
                  {prod.badge || prod.category}
                </span>
                <span className="font-condensed text-3xl font-black text-[#0E0E12] font-tabular">
                  ${prod.price.toFixed(2)}
                </span>
              </div>

              {/* Monogram Graphic Preview */}
              <div
                style={{ backgroundColor: `${prod.bgTint}25` }}
                className="w-full h-36 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden mb-4"
              >
                <HalftoneOverlay variant="lime" opacity={0.15} />
                <div className="font-condensed text-6xl font-black text-black/15 uppercase">
                  {prod.category}
                </div>
                <div className="absolute font-condensed text-xl font-bold uppercase text-[#0E0E12] tracking-wider">
                  {prod.title.split(' ')[0]} {prod.title.split(' ')[1]}
                </div>
              </div>

              {/* Title & Desc */}
              <div>
                <h4 className="font-condensed text-2xl font-bold uppercase leading-tight text-[#0E0E12]">
                  {prod.title}
                </h4>
                <p className="text-xs text-neutral-500 font-medium line-clamp-2 mt-1">
                  {prod.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-t-[36px] sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <span className="font-condensed text-sm font-bold uppercase tracking-wider text-neutral-400">
                PRODUCT DETAILS
              </span>
              <RoundButton
                size="sm"
                variant="translucent"
                onClick={() => setSelectedProduct(null)}
              >
                <X className="w-4 h-4 text-neutral-600" />
              </RoundButton>
            </div>

            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="font-condensed text-3xl font-black uppercase text-[#0E0E12]">
                {selectedProduct.title}
              </h3>
              <div className="font-condensed text-4xl font-black text-[#7B6CF2] font-tabular">
                ${selectedProduct.price.toFixed(2)}
              </div>
            </div>

            <p className="text-xs text-neutral-600 font-medium mb-5">
              {selectedProduct.description}
            </p>

            {/* Size Variant Picker */}
            <div className="mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-400 block mb-2">
                SELECT VARIANT / SIZE
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.variants.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 rounded-xl font-condensed text-base uppercase font-bold cursor-pointer transition-colors ${
                      selectedSize === s
                        ? 'bg-[#0E0E12] text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Variant Picker */}
            <div className="mb-6">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-400 block mb-2">
                COLORWAY
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.variants.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`px-4 py-2 rounded-xl font-condensed text-base uppercase font-bold cursor-pointer transition-colors ${
                      selectedColor === c
                        ? 'bg-[#7B6CF2] text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <BigActionButton
              label="ADD TO CART"
              variant="lime"
              onClick={handleAddToCartModal}
            />
          </div>
        </div>
      )}

      {/* Cart Sheet Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#7B6CF2]" />
                <h3 className="font-condensed text-2xl font-black uppercase text-[#0E0E12]">
                  YOUR FAN CART ({totalCartCount})
                </h3>
              </div>
              <RoundButton
                size="sm"
                variant="translucent"
                onClick={() => setIsCartOpen(false)}
              >
                <X className="w-4 h-4 text-neutral-600" />
              </RoundButton>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-neutral-400 font-condensed text-xl uppercase">
                  Your cart is empty.
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-neutral-100 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-condensed text-xl font-bold uppercase leading-none text-[#0E0E12]">
                        {item.product.title}
                      </div>
                      <div className="text-xs text-neutral-500 font-medium mt-1">
                        Size: {item.selectedSize} · {item.selectedColor}
                      </div>
                      <div className="text-xs font-bold text-neutral-700 mt-0.5">
                        Qty: {item.quantity} × ${item.product.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-condensed text-2xl font-black text-[#0E0E12]">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(idx)}
                        className="text-xs font-bold text-[#F0503C] hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Promo Code Input */}
            {cart.length > 0 && (
              <div className="pt-3 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="PROMO CODE (e.g. LEAGUE10)"
                    className="flex-1 px-3 py-2 rounded-xl bg-neutral-100 font-condensed text-sm uppercase font-bold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    className="px-4 py-2 rounded-xl bg-[#0E0E12] text-white font-condensed text-sm font-bold uppercase cursor-pointer"
                  >
                    APPLY
                  </button>
                </div>
                {discountApplied && (
                  <div className="text-xs font-bold text-emerald-600 mt-1">
                    {discountApplied}
                  </div>
                )}

                {/* Subtotal & Total */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold">
                    <span>SUBTOTAL</span>
                    <span className="font-tabular font-bold">${cartSubtotal.toFixed(2)}</span>
                  </div>
                  {discountApplied && discountApplied.includes('Applied') && (
                    <div className="flex items-center justify-between text-xs text-emerald-600 font-semibold">
                      <span>DISCOUNT</span>
                      <span className="font-tabular font-bold">-$11.90</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-base font-black text-[#0E0E12] pt-1 border-t border-neutral-100">
                    <span className="font-condensed text-2xl">TOTAL</span>
                    <span className="font-condensed text-3xl font-tabular text-[#7B6CF2]">
                      ${cartSubtotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Test Payment Options (Clearly Labelled) */}
                <div className="mt-4 space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                    TEST PAYMENT CHECKOUT
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExecuteCheckout('Apple Pay (Test Sandbox)')}
                    className="w-full py-3 px-4 rounded-xl bg-black text-white font-condensed text-lg font-bold uppercase flex items-center justify-center gap-2 cursor-pointer hover:bg-neutral-800"
                  >
                    <span>PAY WITH APPLE PAY (TEST)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteCheckout('Credit Card (Simulated Auth)')}
                    className="w-full py-3 px-4 rounded-xl bg-[#C8F135] text-black font-condensed text-lg font-bold uppercase flex items-center justify-center gap-2 cursor-pointer hover:opacity-90"
                  >
                    <span>PAY WITH CARD (SIMULATED)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Printable / Downloadable Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl text-[#0E0E12]">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <h3 className="font-condensed text-2xl font-black uppercase">ORDER CONFIRMED</h3>
              </div>
              <RoundButton
                size="sm"
                variant="translucent"
                onClick={() => setActiveReceipt(null)}
              >
                <X className="w-4 h-4" />
              </RoundButton>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-100 font-mono text-xs space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-neutral-500">ORDER ID:</span>
                <span className="font-bold">{activeReceipt.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">TIMESTAMP:</span>
                <span>{activeReceipt.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">PAYMENT:</span>
                <span className="text-emerald-700 font-bold">{activeReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">SECURITY HMAC:</span>
                <span className="truncate max-w-[140px]">{activeReceipt.hmacSignature}</span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {activeReceipt.items.map((it, i) => (
                <div key={i} className="flex justify-between text-xs font-semibold">
                  <span>
                    {it.quantity}x {it.title} ({it.variant})
                  </span>
                  <span className="font-tabular">${(it.price * it.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-base font-black border-t border-neutral-200 pt-2 font-condensed text-xl">
                <span>TOTAL CHARGED</span>
                <span className="text-[#7B6CF2]">${activeReceipt.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 font-condensed text-base font-bold uppercase flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>PRINT</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveReceipt(null)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#C8F135] text-black font-condensed text-base font-black uppercase cursor-pointer"
              >
                DONE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
