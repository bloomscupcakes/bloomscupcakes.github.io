import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const MotionLink = motion(Link);

export default function AllergenInfo({ darkMode }) {
  return (
    <div className={`min-h-screen p-6 ${
      darkMode ? "bg-gray-900" : "bg-gray-50"
    }`}>
      <div className="max-w-3xl mx-auto space-y-8">

        {/* =========================
            HERO
        ========================== */}
        <section className="text-center space-y-2">
          <h1 className={`text-3xl font-bold ${
            darkMode ? "text-pink-400" : "text-black"
          }`}>Allergen Information</h1>
          <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
            Clear ingredient transparency for every cupcake we make.
          </p>
        </section>

        {/* =========================
            ALLERGEN TABLE
        ========================== */}
        <section className={`rounded-2xl shadow p-6 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            darkMode ? "text-gray-100" : "text-black"
          }`}>
            Common Allergens by Product
          </h2>

          <div className="overflow-x-auto">
            <table className={`w-full text-sm border-collapse ${
              darkMode ? "text-gray-300" : "text-black"
            }`}>
              <thead>
                <tr className={`border-b text-left ${
                  darkMode ? "border-gray-600" : "border-gray-300"
                }`}>
                  <th className="p-2">Product</th>
                  <th className="p-2">Milk</th>
                  <th className="p-2">Eggs</th>
                  <th className="p-2">Wheat</th>
                  <th className="p-2">Nuts</th>
                  <th className="p-2">Soy</th>
                </tr>
              </thead>

              <tbody>
                {[
                  ["Vanilla Cupcake", "✔", "✔", "✔", "✖", "✖"],
                  ["Chocolate Cupcake", "✔", "✔", "✔","✖", "✔"],
                  ["Red Velvet Cupcake", "✔", "✔", "✔", "✖", "✔"],
                  ["Floral Topping", "✔", "✔", "✖", "✖", "✖"],
                ].map((row, i) => (
                  <tr key={i} className={`border-b ${
                    darkMode ? "border-gray-600" : "border-gray-300"
                  }`}>
                    {row.map((cell, j) => (
                      <td key={j} className="p-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* =========================
            INGREDIENT NOTES
        ========================== */}
        <section className={`rounded-2xl shadow p-6 space-y-3 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <h2 className={`text-xl font-semibold ${
            darkMode ? "text-gray-100" : "text-black"
          }`}>
            Ingredient Notes
          </h2>

          <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
            • All cupcakes contain wheat, eggs, and dairy as part of the base recipe.
          </p>

          <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
            • Chocolate and red velvet varieties may contain soy-based ingredients.
          </p>

          <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
            • Floral designs use edible sugar decorations and dairy-based frosting.
          </p>
        </section>

        {/* =========================
            CROSS CONTAMINATION
        ========================== */}
        <section className={`border rounded-2xl p-6 ${
          darkMode
            ? "bg-gray-800 border-yellow-700"
            : "bg-yellow-50 border-yellow-200"
        }`}>
          <h2 className={`text-xl font-semibold ${
            darkMode ? "text-yellow-400" : "text-yellow-800"
          }`}>
            Cross-Contamination Notice
          </h2>

          <p className={`mt-2 ${
            darkMode ? "text-gray-400" : "text-gray-700"
          }`}>
            All products are prepared in a shared kitchen environment where
            trace amounts of nuts, dairy, wheat, and soy may be present.
          </p>
        </section>

        {/* =========================
            CONTACT CTA
        ========================== */}
        <section className="text-center space-y-4">
          <h2 className={`text-xl font-semibold ${
            darkMode ? "text-gray-100" : "text-black"
          }`}>
            Need Help With Allergies?
          </h2>

          <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
            Contact us before ordering and we'll help you choose safely.
          </p>

          <MotionLink
            to="/contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`inline-block px-6 py-2 rounded-xl transition ${
              darkMode
                ? "bg-pink-600 text-white hover:bg-pink-700"
                : "bg-pink-500 text-white hover:bg-pink-600"
            }`}
          >
            Contact Us
          </MotionLink>
        </section>

      </div>
    </div>
  );
}