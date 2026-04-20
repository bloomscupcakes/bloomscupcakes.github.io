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
  const navigate = useNavigate();

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 3); // Minimum 3 days lead time
    return today.toISOString().split("T")[0];
  };

  const calculateItemPrice = (item) => {
    // Finds the specific pack size price from the master PRODUCTS list
    const product = PRODUCTS.find(p => p.id === item.id);
    const packSizeObj = product?.packSizes.find(ps => ps.name.startsWith(item.selectedPackSize.toString()));
    const flavourObj = FLAVOURS.find(f => f.label === item.selectedFlavour);
    return (packSizeObj?.price || 0) + (flavourObj?.extra || 0);
  };

  // --- PRICING LOGIC ---
  const uniqueFlavours = [...new Set(cart.map((item) => item.selectedFlavour))];
  const isMultiFlavour = uniqueFlavours.length > 1;
  const multiFlavourCharge = isMultiFlavour ? 5 : 0;

  const itemsSubtotal = cart.reduce((sum, item) => sum + calculateItemPrice(item) * item.quantity, 0);
  const totalSubtotal = itemsSubtotal + multiFlavourCharge;
  const tax = totalSubtotal * 0.13;
  const grandTotal = totalSubtotal + tax;

  // Helper function to generate document ID
  const generateDocumentId = (name) => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD format
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 10); // Clean name, max 10 chars
    const uniqueNum = Date.now().toString().slice(-4); // Last 4 digits of timestamp
    return `${dateStr}_${sanitizedName}_${uniqueNum}`;
  };

  // --- SUBMISSION LOGIC ---
  const handleOrderSubmission = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Track form submission attempt
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
        order: {
          items: orderItems,
          isMultiFlavour,
          subtotal: itemsSubtotal.toFixed(2),
          surcharge: multiFlavourCharge.toFixed(2),
          tax: tax.toFixed(2),
          total: grandTotal.toFixed(2),
          pickupDate: formData.get("pickup_date"),
          notes: formData.get("message"),
        },
        status: "new",
        createdAt: serverTimestamp()
      };

      // Generate custom document ID: date_username_uniqueNumber
      const documentId = generateDocumentId(formData.get("name"));
      const docRef = doc(db, "orders", documentId);
      await setDoc(docRef, finalOrder);

      navigate('/submitted');
      clearCart();
      e.target.reset();
    } catch (err) {
      console.error("Submission Error:", err);
      alert("Oops! Something went wrong. Please check your connection or try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen px-4 py-10 ${darkMode ? "bg-gray-900 text-white" : "bg-[#FFFCFD] text-gray-800"}`}
    >

      {/* GO TO CART BUTTON */}
      <div className="text-center mb-8">
        <button
          onClick={() => document.getElementById('cart-section').scrollIntoView({ behavior: 'smooth' })}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg ${darkMode ? "bg-pink-600 hover:bg-pink-700 text-white" : "bg-pink-500 hover:bg-pink-600 text-white"
            }`}
        >
          ↓ Go to Your Cart
        </button>
      </div>


      {/* ================= STEP 1: PRODUCT SELECTION ================= */}
      <section className="px-4 sm:px-6 py-8">
        <h2 className={`text-3xl font-bold text-center mb-6 ${darkMode ? "text-pink-400" : "text-pink-600"
          }`}>Add More Items to your cart</h2>
        <ProductGrid darkMode={darkMode} />
      </section>


      {/* ================= STEP 2 & 3: CART SUMMARY & CONTACT FORM ================= */}
      <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-12 mt-16 border-t pt-16">

        {/* LEFT COLUMN: THE BOX (CART) - Taking 3/5 of space */}
        <div id="cart-section" className="lg:col-span-3">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-pink-500 uppercase italic tracking-tighter">Your Cart</h2>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${darkMode ? "bg-gray-800" : "bg-pink-100 text-pink-600"}`}>
              {cart.length} unique items
            </span>
          </div>

          {/* 3-DAY NOTICE BANNER */}
          <div className={`max-w-4xl mx-auto mb-10 border-l-4 border-pink-500 p-5 rounded-r-2xl shadow-sm ${darkMode ? "bg-gray-800 text-gray-200" : "bg-pink-50 text-pink-900"
            }`}>
            <div className="flex items-center">
              <p className="text-sm md:text-base">
                <strong>Note: </strong>  We require at least
                <span className="mx-1 px-2 py-0.5 bg-pink-500 text-white rounded-lg font-black italic">3 days </span>
                advance notice before pickup date.
              </p>
            </div>
          </div>


          {cart.length === 0 ? (
            <div className={`p-16 border-2 border-dashed rounded-3xl text-center opacity-40 italic ${darkMode ? "border-gray-700" : "border-pink-200"}`}>
              Your cart is empty. Choose a style above to begin.
            </div>
          ) : (
            <ul className="space-y-2">
              {cart.map((item) => (
                <motion.li
                  layout
                  key={item.cartId}
                  className={`p-2 border-b transition-all flex items-center justify-between ${darkMode ? "border-gray-600" : "border-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="font-bold text-sm leading-tight">{item.title}</h4>
                      <div className="flex gap-1 mt-1">
                        <span className="bg-pink-500 text-white text-[8px] font-black px-1 py-0.5 rounded uppercase">
                          {item.selectedPackSize} Pack
                        </span>
                        <span className={`${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"} text-[8px] font-black px-1 py-0.5 rounded uppercase`}>
                          {item.selectedFlavour}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 p-1 rounded">
                      <button
                        onClick={() => updateItem(item.cartId, "quantity", Math.max(1, item.quantity - 1))}
                        className="w-6 h-6 flex items-center justify-center font-bold text-xs hover:text-pink-500"
                      >
                        −
                      </button>
                      <span className="w-4 text-center font-bold text-xs">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.cartId, "quantity", item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center font-bold text-xs hover:text-pink-500"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-pink-600 text-sm">
                        ${(calculateItemPrice(item) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.cartId)}
                      className="p-1 hover:bg-red-50 hover:text-red-500 rounded text-gray-400"
                    >
                      ✕
                    </button>
                  </div>
                </motion.li>
              ))}

              {/* ORDER TOTALS PANEL */}
              <div className={`p-8 rounded-[2rem] mt-10 space-y-3 border-2 ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-pink-50"
                }`}>
                <div className="flex justify-between text-sm">
                  <span className="opacity-60">Subtotal</span>
                  <span className="font-bold">${itemsSubtotal.toFixed(2)}</span>
                </div>

                {isMultiFlavour && (
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-pink-500 italic">Multi-Flavour Surcharge 🌸</span>
                    <span className="font-bold text-pink-500">+$5.00</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="opacity-60">HST (13%)</span>
                  <span className="font-bold">${tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center border-t-2 border-dotted pt-4 mt-4">
                  <span className="font-black text-lg uppercase tracking-tighter">Grand Total</span>
                  <div className="text-right">
                    <span className="text-4xl font-black text-pink-600">${grandTotal.toFixed(2)}</span>
                    <p className="text-[10px] font-bold opacity-40">ALL PRICES IN CAD</p>
                  </div>
                </div>
              </div>
            </ul>
          )}
        </div>

        {/* RIGHT COLUMN: CONTACT FORM - Taking 2/5 of space */}
        <div className="lg:col-span-2">
          {cart.length > 0 && (
            <form
              onSubmit={handleOrderSubmission}
              className={`p-8 rounded-[2.5rem] shadow-2xl border-2 sticky top-24 ${darkMode ? "bg-gray-800 border-pink-900 shadow-pink-900/10" : "bg-white border-pink-100 shadow-pink-200/40"
                }`}
            >
              <h2 className="text-2xl font-black mb-8 text-center uppercase tracking-tight italic">3. Final Details</h2>
              <div className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-pink-500 ml-2">Name</label>
                  <input name="name" placeholder="E.g. Jane Doe" className={`w-full border-2 p-4 rounded-2xl outline-none focus:border-pink-500 transition-all ${darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-100"}`} required />
                </div>

                <div className="grid gap-5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-pink-500 ml-2">Email</label>
                    <input name="email" type="email" placeholder="hello@example.com" className={`w-full border-2 p-4 rounded-2xl outline-none focus:border-pink-500 transition-all ${darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-100"}`} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-pink-500 ml-2">Phone Number</label>
                    <input name="phone" type="tel" placeholder="123 456 7890" className={`w-full border-2 p-4 rounded-2xl outline-none focus:border-pink-500 transition-all ${darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-100"}`} required />
                  </div>
                </div>

                <div className="p-4 bg-pink-50/50 dark:bg-gray-900/50 rounded-2xl border border-pink-100 dark:border-gray-700">
                  <label className="text-[10px] font-black text-pink-500 uppercase block mb-2">Preferred Contact Method</label>
                  <div className="flex gap-6">
                    {["Email", "Phone"].map(m => (
                      <label key={m} className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" name="contact_method" value={m} required className="w-4 h-4 accent-pink-500" />
                        <span className="text-sm font-bold group-hover:text-pink-500 transition-colors">{m}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-pink-500 uppercase ml-2 italic">Requested Pickup Date</label>
                  <input
                    name="pickup_date"
                    type="date"
                    min={getMinDate()}
                    className={`w-full border-2 p-4 rounded-2xl font-bold outline-none focus:border-pink-500 ${darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-100"}`}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-pink-500 uppercase ml-2">Special Notes</label>
                  <textarea name="message" placeholder="Allergies, color preferences, etc..." className={`w-full border-2 p-4 rounded-2xl h-32 outline-none focus:border-pink-500 ${darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-100"}`} />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 text-white py-5 rounded-[2rem] font-black text-xl transition-all shadow-xl shadow-pink-200 dark:shadow-none hover:-translate-y-1 active:scale-95"
                >
                  {isSubmitting ? "Sending Inquiry..." : "Submit Inquiry"}
                </button>
                <p className="text-[9px] text-center opacity-50 font-bold uppercase tracking-widest px-4 leading-relaxed">
                  By submitting, you agree that this is an inquiry. A confirmation email will be sent to confirm availability.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* SUBMISSION LOADER OVERLAY */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <div className={`p-8 rounded-3xl shadow-2xl border-2 ${darkMode ? "bg-gray-800 border-pink-900" : "bg-white border-pink-100"
              } flex flex-col items-center gap-4`}>
              <Loader type="cupcake" size="xl" />
              <p className="text-lg font-bold text-pink-500">Sending your inquiry...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}