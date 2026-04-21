import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PRODUCTS, FLAVOURS } from "../utils/config";
import { useCart } from "../contexts/CartContext";
import { trackEvent } from "../utils/analytics";
import Loader from "../components/Loader";

// Firebase Imports
import { db } from "../firebase";
import { collection, addDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";
import ProductGrid from "../components/ProductGrid";

export default function Cart({ darkMode }) {
  const { cart, updateItem, removeItem, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fulfillmentMethod, setFulfillmentMethod] = useState("pickup"); // 'pickup' or 'delivery'
  const navigate = useNavigate();

  const DELIVERY_CHARGE = 10.00;

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 3); // Minimum 3 days lead time
    return today.toISOString().split("T")[0];
  };

  const calculateItemPrice = (item) => {
    const product = PRODUCTS.find(p => p.id === item.id);
    const packSizeObj = product?.packSizes.find(ps => ps.name.startsWith(item.selectedPackSize.toString()));
    const flavourObj = FLAVOURS.find(f => f.label === item.selectedFlavour);
    return (packSizeObj?.price || 0) + (flavourObj?.extra || 0);
  };

  // --- PRICING LOGIC ---
  const uniqueFlavours = [...new Set(cart.map((item) => item.selectedFlavour))];
  const currentDeliveryFee = fulfillmentMethod === "delivery" ? DELIVERY_CHARGE : 0;

  const itemsSubtotal = cart.reduce((sum, item) => sum + calculateItemPrice(item) * item.quantity, 0);
  const totalSubtotal = itemsSubtotal + currentDeliveryFee;
  const tax = totalSubtotal * 0.13;
  const grandTotal = totalSubtotal + tax;

  const generateDocumentId = (name) => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 10);
    const uniqueNum = Date.now().toString().slice(-4);
    return `${dateStr}_${sanitizedName}_${uniqueNum}`;
  };

  const handleOrderSubmission = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    trackEvent("begin_checkout", {
      value: grandTotal.toFixed(2),
      currency: "CAD",
      items: cart.length,
      checkout_step: 1
    });

    setIsSubmitting(true);
    const formData = new FormData(e.target);

    try {
      const orderItems = cart.map(i => ({
        productTitle: i.title,
        packSize: `${i.selectedPackSize} Pack`,
        flavour: i.selectedFlavour,
        quantity: i.quantity,
        pricePerUnit: calculateItemPrice(i)
      }));

      const finalOrder = {
        customer: {
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          contactPreference: formData.get("contact_method"),
        },
        fulfillment: {
          method: fulfillmentMethod,
          address: fulfillmentMethod === "delivery" ? formData.get("delivery_address") : "Pickup at Bayshore",
          deliveryFee: currentDeliveryFee.toFixed(2)
        },
        order: {
          items: orderItems,
          subtotal: itemsSubtotal.toFixed(2),
          tax: tax.toFixed(2),
          total: grandTotal.toFixed(2),
          pickupDate: formData.get("pickup_date"),
          notes: formData.get("message"),
        },
        status: "new",
        createdAt: serverTimestamp()
      };

      const documentId = generateDocumentId(formData.get("name"));
      const docRef = doc(db, "orders", documentId);
      await setDoc(docRef, finalOrder);

      navigate('/submitted');
      clearCart();
      e.target.reset();
    } catch (err) {
      console.error("Submission Error:", err);
      alert("Oops! Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      /* FIXED: overflow-x-hidden is the nuclear option for "sticking to the right" issues */
      className={`min-h-screen py-10 overflow-x-hidden w-full ${darkMode ? "bg-gray-900 text-white" : "bg-[#FFFCFD] text-gray-800"}`}
    >
      <div className="text-center mb-8 px-4">
        <button
          onClick={() => document.getElementById('cart-section').scrollIntoView({ behavior: 'smooth' })}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg ${darkMode ? "bg-pink-600 hover:bg-pink-700 text-white" : "bg-pink-500 hover:bg-pink-600 text-white"}`}
        >
          ↓ Go to Your Cart
        </button>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h2 className={`text-2xl sm:text-3xl font-bold text-center mb-6 ${darkMode ? "text-pink-400" : "text-pink-600"}`}>Add More Items</h2>
        <ProductGrid darkMode={darkMode} />
      </section>

      {/* FIXED: Removed gap-12 on mobile (too wide) and used gap-8. Added w-full */}
      <div className="max-w-5xl mx-auto px-4 grid lg:grid-cols-5 gap-8 lg:gap-12 mt-16 border-t pt-16 w-full">
        
        {/* LEFT COLUMN: CART SUMMARY */}
        <div id="cart-section" className="lg:col-span-2 w-full">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-pink-500 uppercase italic tracking-tighter">Your Cart</h2>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${darkMode ? "bg-gray-800" : "bg-pink-100 text-pink-600"}`}>
              {cart.length} unique items
            </span>
          </div>

          <div className={`mb-10 border-l-4 border-pink-500 p-4 sm:p-5 rounded-r-2xl shadow-sm ${darkMode ? "bg-gray-800 text-gray-200" : "bg-pink-50 text-pink-900"}`}>
            <p className="text-sm break-words">
              <strong>Note: </strong> We require at least
              <span className="mx-1 px-2 py-0.5 bg-pink-500 text-white rounded-lg font-black italic inline-block">3 days</span>
              notice.
            </p>
          </div>

          {cart.length === 0 ? (
            <div className={`p-10 border-2 border-dashed rounded-3xl text-center opacity-40 italic ${darkMode ? "border-gray-700" : "border-pink-200"}`}>
              Your cart is empty.
            </div>
          ) : (
            <ul className="space-y-2 w-full">
              {cart.map((item) => (
                <motion.li
                  layout
                  key={item.cartId}
                  className={`p-3 border-b flex items-center justify-between gap-2 sm:gap-4 transition-colors ${darkMode ? "border-gray-800" : "border-gray-100"}`}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-xs sm:text-sm leading-tight truncate ${darkMode ? "text-white" : "text-gray-900"}`}>{item.title}</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="bg-pink-500 text-white text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded uppercase">{item.selectedPackSize} Pack</span>
                      <span className={`text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"}`}>{item.selectedFlavour}</span>
                    </div>
                  </div>

                  {/* Quantity Controls: Shrink slightly for small screens */}
                  <div className={`flex items-center gap-1 rounded-full border p-0.5 sm:p-1 ${darkMode ? "bg-gray-950 border-gray-700" : "bg-gray-100 border-gray-200"}`}>
                    <button onClick={() => updateItem(item.cartId, "quantity", Math.max(1, item.quantity - 1))} className="h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center rounded-full bg-white text-gray-600 shadow-sm text-xs">-</button>
                    <span className="w-4 sm:w-6 text-center text-xs font-black">{item.quantity}</span>
                    <button onClick={() => updateItem(item.cartId, "quantity", item.quantity + 1)} className="h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center rounded-full bg-white text-gray-600 shadow-sm text-xs">+</button>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className="text-xs sm:text-sm font-bold text-pink-600">${(calculateItemPrice(item) * item.quantity).toFixed(2)}</p>
                    <button onClick={() => removeItem(item.cartId)} className="text-gray-400 p-1">✕</button>
                  </div>
                </motion.li>
              ))}

              {/* Total Box: Reduced padding for mobile */}
              <div className={`p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] mt-10 space-y-3 border-2 ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-pink-50"}`}>
                <div className="flex justify-between text-sm">
                  <span className="opacity-60">Subtotal</span>
                  <span className="font-bold">${itemsSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-60">HST (13%)</span>
                  <span className="font-bold">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-t-2 border-dotted pt-4 mt-4">
                  <span className="font-black text-base sm:text-lg uppercase">Total</span>
                  <div className="text-right">
                    <span className="text-3xl sm:text-4xl font-black text-pink-600">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </ul>
          )}
        </div>

        {/* RIGHT COLUMN: CONTACT FORM */}
        <div className="lg:col-span-3 w-full">
          {cart.length > 0 && (
            <form onSubmit={handleOrderSubmission} className={`p-5 sm:p-8 rounded-[2rem] shadow-xl border-2 lg:sticky lg:top-24 w-full ${darkMode ? "bg-gray-800 border-pink-900" : "bg-white border-pink-100"}`}>
              <h2 className="text-xl font-black mb-6 text-center uppercase italic">Order Details</h2>
              
              <div className="space-y-4">
                {/* Fulfillment Buttons: Changed to 1 col for very small screens if needed, or kept grid-cols-2 */}
                <div className={`p-4 rounded-2xl border-2 ${darkMode ? "bg-gray-900/50 border-gray-700" : "bg-pink-50/50 border-pink-100"}`}>
                  <label className="text-[10px] font-black text-pink-500 uppercase block mb-3">Pickup or Delivery?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setFulfillmentMethod("pickup")} className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase ${fulfillmentMethod === "pickup" ? "bg-pink-500 text-white" : "bg-transparent text-gray-500"}`}>Pickup</button>
                    <button type="button" onClick={() => setFulfillmentMethod("delivery")} className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase ${fulfillmentMethod === "delivery" ? "bg-pink-500 text-white" : "bg-transparent text-gray-500"}`}>Delivery</button>
                  </div>
                  
                  {fulfillmentMethod === "delivery" && (
                    <input name="delivery_address" placeholder="Address" className="w-full border-2 p-3 mt-3 rounded-xl text-sm outline-none focus:border-pink-500 bg-white" required />
                  )}
                </div>

                {/* Name, Email, Phone: Use full width strictly */}
                <input name="name" placeholder="Name" className="w-full border-2 p-3 rounded-xl text-sm outline-none focus:border-pink-500" required />
                
                <div className="grid sm:grid-cols-2 gap-3">
                  <input name="email" type="email" placeholder="Email" className="w-full border-2 p-3 rounded-xl text-sm outline-none focus:border-pink-500" required />
                  <input name="phone" type="tel" placeholder="Phone" className="w-full border-2 p-3 rounded-xl text-sm outline-none focus:border-pink-500" required />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-pink-500 uppercase ml-2">Requested Date</label>
                  <input name="pickup_date" type="date" min={getMinDate()} className="w-full border-2 p-3 rounded-xl font-bold text-sm" required />
                </div>

                <textarea name="message" placeholder="Special Notes..." className="w-full border-2 p-3 rounded-xl h-24 text-sm outline-none focus:border-pink-500" />

                <button type="submit" disabled={isSubmitting} className="w-full bg-pink-500 text-white py-4 rounded-[1.5rem] font-black text-lg shadow-lg active:scale-95 transition-transform">
                  {isSubmitting ? "Sending..." : "Submit Inquiry"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <div className="h-10" />
    </motion.div>
  );
}
