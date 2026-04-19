import { motion } from "framer-motion";
import { FaInstagram, FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import { useEffect } from "react";
import { trackEvent } from "../utils/analytics";

export default function Order({ darkMode }) {
  // Helper to track contact clicks for Google Ads
  const google_ad_lead = (method) => {
    trackEvent("generate_lead", { 
      contact_method: method 
    }, true);
  };

  return (
    <div className={`min-h-screen px-6 py-16 ${darkMode
        ? "bg-gray-900 text-gray-100"
        : "bg-[#FFF7F9] text-[#2B2B2B]"
      }`}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto"
      >
        <h1 className={`text-5xl font-bold mb-4 ${darkMode ? "text-pink-400" : "text-[#E85D75]"
          }`}>
          Place an Order 🧁
        </h1>

        <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"
          }`}>
          We’re currently taking orders through Instagram, email, or phone.
          Reach out and we’ll help you create the perfect cupcakes for your occasion.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto"
      >
        <p className={`text-lg ${darkMode ? "text-red-400" : "text-red-600"
          }`}>
            Note: we require orders to be placed at least 3 days in advance.
        </p>

      </motion.div>

      {/* Options */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          show: {
            transition: { staggerChildren: 0.15 },
          },
        }}
        className="grid md:grid-cols-3 gap-8 mt-14 max-w-5xl mx-auto"
      >
        {[
          {
            icon: <FaInstagram size={26} />,
            title: "Order via Instagram",
            text: "Send us a DM with your order details and we’ll get back to you quickly.",
            link: "https://www.instagram.com/bloomscupcakes.ca",
            external: true,
          },
          {
            icon: <FaEnvelope size={26} />,
            title: "Order via Email",
            text: "Share your requirements at bloomscupcakes@gmail.com and we’ll respond with availability and details.",
            link: "mailto:bloomscupcakes@gmail.com",
          },
          {
            icon: <FaPhoneAlt size={24} />,
            title: "Call to Order",
            text: "Prefer talking? Give us a call and we’ll take your order directly. (343) 987-9593",
            link: "tel:3439879593",
          },
        ].map((item, i) => (
          <motion.a
            key={i}
            href={item.link}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener noreferrer" : undefined}
            variants={{
              hidden: { opacity: 0, y: 30 },
              show: { opacity: 1, y: 0 },
            }}
            whileHover={{ scale: 1.05 }}
            className={`rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition border ${darkMode
                ? "bg-gray-800 border-pink-700 text-gray-100"
                : "bg-white border-[#F7B2C4]"
              }`}
          >
            <div className={`flex justify-center mb-4 ${darkMode ? "text-pink-400" : "text-[#E85D75]"
              }`}>
              {item.icon}
            </div>

            <h3 className="font-semibold text-lg mb-2">
              {item.title}
            </h3>

            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"
              }`}>
              {item.text}
            </p>
          </motion.a>
        ))}
      </motion.div>

      {/* Extra note */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mt-16 max-w-xl mx-auto"
      >
        <p className="text-gray-500">
          Please include your preferred date, quantity, and any custom design requests.
        </p>
      </motion.div>
    </div>
  );
}