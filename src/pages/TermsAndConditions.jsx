import { motion } from "framer-motion";

const sections = [
  {
    title: "Home-Based Business",
    content:
      "Blooms Cupcakes is a home-based bakery. Products are prepared in a domestic kitchen that is not subject to commercial food facility inspection. We follow safe food handling practices.",
  },
  {
    title: "Orders",
    content:
      "Orders can be placed through our website or contact channels. An order is confirmed only after we accept it. We reserve the right to decline orders based on availability.",
  },
  {
    title: "Pricing",
    content:
      "All prices are in CAD. Prices may change without notice. Custom designs or special requests may include additional charges.",
  },
  {
    title: "Custom Orders",
    content:
      "All cupcakes are handmade. Designs may slightly vary from reference images. We aim to match your request as closely as possible, but exact replication is not guaranteed.",
  },
  {
    title: "Allergens",
    content:
      "Our kitchen may handle milk, eggs, wheat, nuts, and soy. We cannot guarantee an allergen-free environment. Please inform us of allergies before ordering.",
  },
  {
    title: "Payment",
    content:
      "Payment details are provided upon order confirmation. Some orders may require deposit or full payment in advance before preparation begins.",
  },
  {
    title: "Cancellations",
    content:
      "Cancellations must be made before baking begins. Once preparation starts, cancellations may not be accepted. Refunds are handled case-by-case.",
  },
  {
    title: "Pickup & Delivery",
    content:
      "Pickup or delivery details are agreed upon at ordering time. We are not responsible for incorrect details or delays caused by customer-provided information.",
  },
  {
    title: "Website Content",
    content:
      "All branding, images, and content belong to Blooms Cupcakes and may not be reused without permission.",
  },
  {
    title: "Liability",
    content:
      "We are not responsible for reactions due to allergens or improper storage after pickup or delivery.",
  },
];

export default function TermsAndConditions({ darkMode }) {
  return (
    <div className={`min-h-screen px-6 py-12 flex justify-center ${
      darkMode ? "bg-gray-900" : "bg-gray-50"
    }`}>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl space-y-6"
      >

        {/* HEADER */}
        <div className="text-center mb-10 space-y-2">
          <h1 className={`text-4xl font-bold ${
            darkMode ? "text-pink-400" : "text-pink-500"
          }`}>
            Terms & Conditions
          </h1>
          <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
            Please read these terms before placing an order.
          </p>
        </div>

        {/* SECTIONS */}
        {sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-xl shadow p-6 border transition hover:shadow-md ${
              darkMode
                ? "bg-gray-800 border-pink-700 text-gray-100"
                : "bg-white border-pink-100"
            }`}
          >
            <h2 className={`text-lg font-semibold mb-2 ${
              darkMode ? "text-pink-400" : "text-pink-600"
            }`}>
              {section.title}
            </h2>
            <p className={`leading-relaxed ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}>
              {section.content}
            </p>
          </motion.div>
        ))}

        {/* FOOTER */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className={`text-center text-sm pt-6 ${
            darkMode ? "text-gray-500" : "text-gray-500"
          }`}
        >
          Last updated: April 14, 2026 • Blooms Cupcakes
        </motion.div>

      </motion.div>
    </div>
  );
}