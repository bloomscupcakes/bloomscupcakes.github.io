import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { PRODUCTS } from "../utils/config";
import AddItemModal from "../components/AddItemModal";
import { useCart } from "../contexts/CartContext";
import { trackEvent } from "../utils/analytics";
import Loader from "../components/Loader";

// Firebase Imports
import { db } from "../firebase";
import { collection, addDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";
import ProductGrid from "../components/ProductGrid";

export default function Cart({ darkMode }) {
  const { cart, addItem, updateItem, removeItem, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fulfillmentMethod, setFulfillmentMethod] = useState("pickup"); // 'pickup' or 'delivery'
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  const DELIVERY_CHARGE = 10.00;

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 3); // Minimum 3 days lead time
    return today.toISOString().split("T")[0];
  };

  const calculateItemPrice = (item) => {
    const product = PRODUCTS.find(p => p.id === item.id);
    const selectedPackSize = item.selectedPackSize || item.packSize;
    const selectedFlavour = item.selectedFlavour || item.flavour;
    const selectedFilling = item.selectedFilling || item.filling;
    const selectedDiameters = Array.isArray(item.selectedDiameters)
      ? item.selectedDiameters
      : Array.isArray(item.diameters)
      ? item.diameters
      : item.selectedDiameters
      ? [item.selectedDiameters]
      : item.diameters
      ? [item.diameters]
      : [];

    const packSizeObj = product?.packSizes.find(ps => ps.name.startsWith(selectedPackSize.toString()));
    const flavourOptions = product?.flavours;
    const flavourObj = flavourOptions.find(f => f.label === selectedFlavour);
    const fillingObj = product?.fillings?.find(f => f.label === selectedFilling);
    const diameterExtra = selectedDiameters.reduce(
      (sum, label) => sum + (product?.diameters?.find(d => String(d.label) === String(label))?.extra || 0),
      0
    );

    return (
      (packSizeObj?.price || 0) +
      (flavourObj?.extra || 0) +
      (fillingObj?.extra || 0) +
      diameterExtra
    );
  };

  const getTierCount = (packName) => {
    if (/3\s*tier/i.test(packName)) return 3;
    if (/2\s*tier/i.test(packName)) return 2;
    if (/single/i.test(packName)) return 1;
    return 1;
  };

  const handleAddFromModal = (item) => {
    addItem(item);
    setShowAddModal(false);
  };

  // Read query params like ?id=floral&pack=1&flavour=1 or repeated: ?id=floral&id=classic&pack=1&pack=2
  const location = useLocation();
  const urlCartLoadedRef = useRef(false);

  useEffect(() => {
    if (urlCartLoadedRef.current) return;

    try {
      const params = new URLSearchParams(location.search);
      // helper to parse repeated keys and comma-separated values
      const parseList = (key) => {
        const all = params.getAll(key) || [];
        if (all.length === 0 && params.has(key)) {
          const v = params.get(key) || "";
          return v.split(",").map(s => s.trim()).filter(Boolean);
        }
        // flatten comma-separated entries
        return all.flatMap(v => v.split(",").map(s => s.trim()).filter(Boolean));
      };

      const ids = parseList("id");
      if (!ids || ids.length === 0) return; // nothing to do

      urlCartLoadedRef.current = true;
      const packs = parseList("pack");
      const flavoursParam = parseList("flavour");
      const fills = parseList("filling");
      const diametersParam = parseList("diameter");
      const qtys = parseList("quantity").map(q => Number(q) || 1);

      // Build items and overwrite existing cookie cart
      clearCart();
      let diameterIndex = 0;

      ids.forEach((productId, idx) => {
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) return; // skip unknown product

        const packRaw = packs[idx] || packs[0] || "";
        let selectedPackSize = product.packSizes?.[0]?.name || "";
        if (packRaw) {
          const maybeNum = Number(packRaw);
          if (!Number.isNaN(maybeNum)) {
            // treat numeric as 1-based index if >=1, else 0-based
            const useIdx = maybeNum >= 1 ? maybeNum - 1 : 0;
            if (product.packSizes?.[useIdx]) selectedPackSize = product.packSizes[useIdx].name;
          } else {
            // try to match by name
            const match = product.packSizes?.find(ps => ps.name.toLowerCase() === packRaw.toLowerCase());
            if (match) selectedPackSize = match.name;
          }
        }

        const flavourRaw = flavoursParam[idx] || flavoursParam[0] || "";
        let selectedFlavour = "";
        if (flavourRaw) {
          const flavourOptions = product?.flavours;
          const maybeNumF = Number(flavourRaw);
          if (!Number.isNaN(maybeNumF)) {
            const useIdx = maybeNumF >= 1 ? maybeNumF - 1 : 0;
            if (flavourOptions?.[useIdx]) selectedFlavour = flavourOptions[useIdx].label;
          } else {
            const matchF = flavourOptions.find(f => f.label.toLowerCase() === flavourRaw.toLowerCase());
            if (matchF) selectedFlavour = matchF.label;
          }
        }

        const fillRaw = fills[idx] || fills[0] || "";
        let selectedFilling = product?.fillings?.[0]?.label || "";
        if (fillRaw && product?.fillings) {
          const maybeNumFill = Number(fillRaw);
          if (!Number.isNaN(maybeNumFill)) {
            const useIdx = maybeNumFill >= 1 ? maybeNumFill - 1 : 0;
            if (product.fillings?.[useIdx]) selectedFilling = product.fillings[useIdx].label;
          } else {
            const matchFill = product.fillings?.find(f => f.label.toLowerCase() === fillRaw.toLowerCase());
            if (matchFill) selectedFilling = matchFill.label;
          }
        }

        const diameterCount = product?.diameters ? getTierCount(selectedPackSize) : 0;
        const selectedDiameters = [];
        for (let tier = 0; tier < diameterCount; tier += 1) {
          const rawDiameter = diametersParam[diameterIndex] || "";
          let selectedDiameter = product.diameters?.[0]?.label || "";
          if (rawDiameter) {
            const maybeNumD = Number(rawDiameter);
            if (!Number.isNaN(maybeNumD)) {
              const matchD = product.diameters?.find((d) => Number(d.label) === maybeNumD);
              if (matchD) selectedDiameter = matchD.label;
            } else {
              const matchD = product.diameters?.find((d) => String(d.label).toLowerCase() === rawDiameter.toLowerCase());
              if (matchD) selectedDiameter = matchD.label;
            }
          }
          selectedDiameters.push(selectedDiameter);
          diameterIndex += 1;
        }

        const quantity = qtys[idx] || 1;

        addItem({
          id: product.id,
          title: product.title,
          selectedPackSize,
          selectedFlavour,
          selectedFilling,
          selectedDiameters,
          quantity: Number(quantity) || 1,
        });
      });
    } catch (err) {
      console.warn("Failed to parse cart from URL:", err);
    }
  }, [location.search]);

  useEffect(() => {
    const buildSearch = () => {
      if (!cart || cart.length === 0) return "";

      const params = new URLSearchParams();
      cart.forEach((item) => {
        params.append("id", item.id);

        const product = PRODUCTS.find((p) => p.id === item.id);
        const packIndex = product?.packSizes?.findIndex((ps) => ps.name === item.selectedPackSize);
        if (packIndex !== undefined && packIndex >= 0) {
          params.append("pack", String(packIndex + 1));
        } else {
          params.append("pack", item.selectedPackSize || "");
        }

        params.append("flavour", item.selectedFlavour || "");
        if (item.selectedFilling) {
          params.append("filling", item.selectedFilling);
        }
        if (Array.isArray(item.selectedDiameters)) {
          item.selectedDiameters.forEach((diam) => {
            if (diam !== undefined && diam !== null && diam !== "") {
              params.append("diameter", String(diam));
            }
          });
        }
        params.append("quantity", String(item.quantity || 1));
      });
      return params.toString();
    };

    const newSearch = buildSearch();
    const currentSearch = location.search.startsWith("?") ? location.search.slice(1) : location.search;

    if (newSearch !== currentSearch) {
      navigate({ pathname: location.pathname, search: newSearch ? `?${newSearch}` : "" }, { replace: true });
    }
  }, [cart, location.pathname, location.search, navigate]);

  // --- PRICING LOGIC ---
  const uniqueFlavours = [...new Set(cart.map((item) => item.selectedFlavour))];
  const currentDeliveryFee = fulfillmentMethod === "delivery" ? DELIVERY_CHARGE : 0;

  const itemsSubtotal = cart.reduce((sum, item) => sum + calculateItemPrice(item) * item.quantity, 0);
  const totalSubtotal = itemsSubtotal + currentDeliveryFee;
  const tax = 0; // totalSubtotal * 0.13;
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
      const orderItems = cart.map(i => {
        const selectedPackSize = i.selectedPackSize || i.packSize;
        const selectedFlavour = i.selectedFlavour || i.flavour;
        const selectedFilling = i.selectedFilling || i.filling || "";
        const selectedDiameters = Array.isArray(i.selectedDiameters)
          ? i.selectedDiameters
          : Array.isArray(i.diameters)
          ? i.diameters
          : i.selectedDiameters
          ? [i.selectedDiameters]
          : i.diameters
          ? [i.diameters]
          : [];

        return {
          productTitle: i.title,
          packSize: selectedPackSize,
          flavour: selectedFlavour,
          filling: selectedFilling,
          diameters: selectedDiameters,
          quantity: i.quantity,
          pricePerUnit: calculateItemPrice(i)
        };
      });

      const finalOrder = {
        customer: {
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          contactPreference: formData.get("contact_method") || "Email",
        },
        fulfillment: {
          method: fulfillmentMethod,
          address: fulfillmentMethod === "delivery" ? formData.get("delivery_address") : "Pickup at Bayshore",
          deliveryFee: currentDeliveryFee.toFixed(2),
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

      console.log("Saving order to Firebase:", finalOrder);

      if (db) {
        const orderName = formData.get("name") || "customer";
        const documentId = generateDocumentId(orderName);
        const docRef = doc(db, "orders", documentId);

        try {
          await setDoc(docRef, finalOrder);
          console.log("Order saved successfully with ID:", documentId);
        } catch (firebaseError) {
          console.error("Firebase save failed:", firebaseError);
          console.warn("Proceeding despite Firebase error - user will see submitted page");
        }
      } else {
        console.warn("Firebase is not configured. Skipping order save for this deployment.");
      }

      // --- SEND DISCORD NOTIFICATION ---
      // Replace with your Discord Webhook URL or Cloudflare Proxy endpoint
      const WORKER_URL = "https://discord.bloomscupcakes.workers.dev";

      try {
        await fetch(WORKER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalOrder),
        });
        console.log("Discord notification proxy call successful!");
      } catch (discordErr) {
        console.error("Failed to trigger Discord webhook proxy:", discordErr);
      }

      clearCart();
      e.target.reset();
      
      console.log("Before navigate, isSubmitting:", isSubmitting);
      console.log("Navigating to /submitted");
      setIsSubmitting(false);
      setTimeout(() => {
        console.log("After timeout, about to navigate");
        navigate('/submitted', { replace: true });
        console.log("Navigate called");
      }, 100);
    } catch (err) {
      console.error("Form processing error:", err);
      console.error("Error message:", err.message);
      setIsSubmitting(false);
      alert("Oops! Something went wrong. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen py-10 overflow-x-hidden w-full transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-[#FFFCFD] text-gray-800"
        }`}
    >
      <div className="flex justify-center mb-8 px-4 text-center">
        <Link
          to="/menu"
          className="group text-sm text-gray-600 hover:text-pink-600 transition-colors duration-200"
        >
          <span className="font-semibold text-pink-500 group-hover:underline inline-flex items-center gap-1">
            View our menu <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </span>
        </Link>
      </div>
      <div className="max-w-5xl mx-auto px-4 grid lg:grid-cols-5 gap-8 lg:gap-12 mt-4 border-pink-100 dark:border-gray-800 pt-16 w-full">

        {/* LEFT COLUMN: CART SUMMARY */}
        <div id="cart-section" className="lg:col-span-2 w-full">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-pink-500 uppercase italic tracking-tighter">Your Cart</h2>
          
          </div>

          <div className={`mb-10 border-l-4 border-pink-500 p-4 sm:p-5 rounded-r-2xl shadow-sm ${darkMode ? "bg-gray-800/50 text-gray-300" : "bg-pink-50 text-pink-900"
            }`}>
            <p className="text-sm break-words">
              <strong>Note: </strong> We require at least
              <span className="mx-1 px-2 py-0.5 bg-pink-500 text-white rounded-lg font-black italic inline-block">3 days</span>
              notice.
            </p>
          </div>

          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="rounded-full bg-pink-500 px-4 py-2 text-[12px] font-black uppercase text-white transition hover:bg-pink-600"
            >
              + Add item
            </button>
          </div>

          {cart.length === 0 ? (
            <div className={`p-10 border-2 border-dashed rounded-3xl text-center opacity-40 italic ${darkMode ? "border-gray-700" : "border-pink-200"
              }`}>
              Your cart is empty.
            </div>
          ) : (
            <ul className="space-y-2 w-full">
              {cart.map((item) => (
                <motion.li
                  layout
                  key={item.cartId}
                  className={`p-3 border-b flex items-center justify-between gap-2 sm:gap-4 transition-colors ${darkMode ? "border-gray-800 hover:bg-gray-800/30" : "border-gray-100 hover:bg-pink-50/30"
                    }`}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-xs sm:text-sm leading-tight truncate ${darkMode ? "text-white" : "text-gray-900"
                      }`}>
                      {item.title}
                    </h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="bg-pink-500 text-white text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                        {item.selectedPackSize}
                      </span>
                      <span className={`text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                        }`}>
                        {item.selectedFlavour}
                      </span>
                      {item.selectedFilling && (
                        <span className={`text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                          }`}>
                          {item.selectedFilling}
                        </span>
                      )}
                      {Array.isArray(item.selectedDiameters) && item.selectedDiameters.length > 0 && (
                        <span className={`text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                          }`}>
                          {item.selectedDiameters.map((diam) => `${diam}"`).join(" / ")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={`flex items-center gap-1 rounded-full border p-0.5 sm:p-1 ${darkMode ? "bg-gray-950 border-gray-700" : "bg-gray-50 border-gray-200"
                    }`}>
                    <button
                      onClick={() => updateItem(item.cartId, "quantity", Math.max(1, item.quantity - 1))}
                      className={`h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center rounded-full shadow-sm text-xs transition-colors ${darkMode ? "bg-gray-800 text-white hover:bg-pink-600" : "bg-white text-gray-600 hover:bg-pink-500 hover:text-white"
                        }`}>-</button>
                    <span className="w-4 sm:w-6 text-center text-xs font-black">{item.quantity}</span>
                    <button
                      onClick={() => updateItem(item.cartId, "quantity", item.quantity + 1)}
                      className={`h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center rounded-full shadow-sm text-xs transition-colors ${darkMode ? "bg-gray-800 text-white hover:bg-pink-600" : "bg-white text-gray-600 hover:bg-pink-500 hover:text-white"
                        }`}>+</button>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className={`text-xs sm:text-sm font-bold ${darkMode ? "text-pink-400" : "text-pink-600"}`}>
                      ${(calculateItemPrice(item) * item.quantity).toFixed(2)}
                    </p>
                    <button onClick={() => removeItem(item.cartId)} className="text-gray-400 hover:text-red-500 transition-colors p-1">✕</button>
                  </div>
                </motion.li>
              ))}

              <div className={`p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] mt-10 space-y-3 border-2 transition-colors ${darkMode ? "bg-gray-800/40 border-gray-700" : "bg-white border-pink-50 shadow-sm"
                }`}>
                <div className="flex justify-between text-sm">
                  <span className="opacity-60">Subtotal</span>
                  <span className="font-bold">${itemsSubtotal.toFixed(2)}</span>
                </div>
                {/* DYNAMIC DELIVERY FEE ROW */}
                <AnimatePresence>
                  {fulfillmentMethod === "delivery" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex justify-between text-sm overflow-hidden"
                    >
                      <span className="opacity-60">Delivery Fee</span>
                      <span>${DELIVERY_CHARGE}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* <div className="flex justify-between text-sm">
                  <span className="opacity-60">HST (13%)</span>
                  <span className="font-bold">${tax.toFixed(2)}</span>
                </div> */}
                <div className={`flex justify-between items-center border-t-2 border-dotted pt-4 mt-4 ${darkMode ? "border-gray-600" : "border-pink-100"
                  }`}>
                  <span className="font-black text-base sm:text-lg uppercase">Total</span>
                  <div className="text-right">
                    <span className="text-3xl sm:text-4xl font-black text-pink-600">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </ul>
          )}
          <AnimatePresence>
            {showAddModal && (
              <AddItemModal
                products={PRODUCTS}
                flavours={PRODUCTS.flatMap(p => p.flavours || [])}
                darkMode={darkMode}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddFromModal}
              />
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: CONTACT FORM */}
        <div className="lg:col-span-3 w-full">
          {cart.length > 0 && (
            <form onSubmit={handleOrderSubmission} className={`p-5 sm:p-8 rounded-[2rem] shadow-xl border-2 lg:sticky lg:top-24 w-full transition-all ${darkMode ? "bg-gray-800 border-pink-900/50 shadow-black/20" : "bg-white border-pink-100"
              }`}>
              <h2 className="text-xl font-black mb-6 text-center uppercase italic tracking-tight">Order Details</h2>

              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border-2 ${darkMode ? "bg-gray-900/50 border-gray-700" : "bg-pink-50/30 border-pink-100"
                  }`}>
                  <label className="text-[10px] font-black text-pink-500 uppercase block mb-3">Pickup or Delivery?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFulfillmentMethod("pickup")}
                      className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${fulfillmentMethod === "pickup" ? "bg-pink-500 border-pink-500 text-white" : (darkMode ? "bg-gray-800 border-gray-700 text-gray-500" : "bg-white border-gray-100 text-gray-400")
                        }`}>Pickup</button>
                    <button
                      type="button"
                      onClick={() => setFulfillmentMethod("delivery")}
                      className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${fulfillmentMethod === "delivery" ? "bg-pink-500 border-pink-500 text-white" : (darkMode ? "bg-gray-800 border-gray-700 text-gray-500" : "bg-white border-gray-100 text-gray-400")
                        }`}>Delivery +${DELIVERY_CHARGE}</button>
                  </div>

                  {fulfillmentMethod === "delivery" && (
                    <input
                      name="delivery_address"
                      placeholder="Street Address in Ottawa"
                      className={`w-full border-2 p-3 mt-3 rounded-xl text-sm outline-none focus:border-pink-500 transition-colors ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-100"
                        }`}
                      required
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-pink-500 ml-2">Name</label>
                  <input
                    name="name"
                    placeholder="Jane Doe"
                    className={`w-full border-2 p-3 rounded-xl text-sm outline-none focus:border-pink-500 transition-colors ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-gray-50 border-gray-100"
                      }`}
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-pink-500 ml-2">Email</label>
                    <input
                      name="email"
                      type="email"
                      placeholder="hello@example.com"
                      className={`w-full border-2 p-3 rounded-xl text-sm outline-none focus:border-pink-500 transition-colors ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-gray-50 border-gray-100"
                        }`}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-pink-500 ml-2">Phone</label>
                    <input
                      name="phone"
                      type="tel"
                      placeholder="343-000-0000"
                      className={`w-full border-2 p-3 rounded-xl text-sm outline-none focus:border-pink-500 transition-colors ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-gray-50 border-gray-100"
                        }`}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-pink-500 ml-2">Preferred Contact Method</label>
                  <select
                    name="contact_method"
                    defaultValue="Email"
                    className={`w-full border-2 p-3 rounded-xl text-sm outline-none focus:border-pink-500 transition-colors ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-gray-50 border-gray-100"
                      }`}
                  >
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="Text">Text</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-pink-500 uppercase ml-2">Requested Date</label>
                  <input
                    name="pickup_date"
                    type="date"
                    min={getMinDate()}
                    className={`w-full border-2 p-3 rounded-xl font-bold text-sm outline-none focus:border-pink-500 transition-colors ${darkMode ? "bg-gray-900 border-gray-700 text-white color-scheme-dark" : "bg-gray-50 border-gray-100"
                      }`}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-pink-500 ml-2">Notes</label>
                  <textarea
                    name="message"
                    placeholder="Allergies, color preferences..."
                    className={`w-full border-2 p-3 rounded-xl h-24 text-sm outline-none focus:border-pink-500 transition-colors ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-gray-50 border-gray-100"
                      }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-[1.5rem] font-black text-lg shadow-lg active:scale-95 transition-all disabled:bg-gray-400 ${darkMode ? "shadow-pink-900/20" : "shadow-pink-200"
                    }`}
                >
                  {isSubmitting ? "Sending..." : "Submit"}
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