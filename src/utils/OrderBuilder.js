// 1. Remove Storage imports, keep Firestore
import { db } from "../firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// ... (Inside OrderBuilder component)

  const handleOrderSubmission = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target);

    try {
      // Map Cart Items for DB
      const orderItems = cart.map(i => ({
        productTitle: i.title,
        packSize: i.selectedPackSize,
        flavour: i.selectedFlavour,
        quantity: i.quantity,
        priceAtPurchase: calculateItemPrice(i)
      }));

      // Construct Final Data (No image URL needed)
      const finalOrder = {
        customer: {
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          contactPreference: formData.get("contact_method"),
          serviceType: formData.get("service_type")
        },
        order: {
          items: orderItems,
          isMultiFlavour,
          subtotal: itemsSubtotal,
          surcharge: multiFlavourCharge,
          tax: tax.toFixed(2),
          total: grandTotal.toFixed(2),
          pickupDate: formData.get("pickup_date"),
          themeDescription: formData.get("theme_description"), // New field
          notes: formData.get("message")
        },
        status: "new",
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "orders"), finalOrder);

      alert("🎉 Inquiry sent! I'll be in touch soon to discuss your design.");
      setCart([]);
      e.target.reset();
    } catch (err) {
      console.error("Submission Error:", err);
      alert("Oops! Something went wrong. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (Inside your JSX Form)

  {/* Replace the File Input with this: */}
  <div>
    <label className="text-[10px] font-bold text-pink-500 uppercase ml-1">Theme or Inspiration</label>
    <textarea 
      name="theme_description" 
      placeholder="e.g., Pastel pink roses, butterfly theme, or paste a Pinterest link..." 
      className={`w-full border p-3 rounded-xl h-20 text-sm outline-none focus:ring-2 focus:ring-pink-300 ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-200"}`} 
    />
  </div>