import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const MotionLink = motion(Link);

export default function AllergenInfo() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* =========================
            HERO
        ========================== */}
        <section className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Allergen Information</h1>
          <p className="text-gray-600">
            Clear ingredient transparency for every cupcake we make.
          </p>
        </section>

        {/* =========================
            ALLERGEN TABLE
        ========================== */}
        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Common Allergens by Product
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Product</th>
                  <th className="p-2">Milk</th>
                  <th className="p-2">Eggs</th>
                  <th className="p-2">Wheat</th>
                  <th className="p-2">Sugar</th>
                  <th className="p-2">Nuts</th>
                  <th className="p-2">Soy</th>
                </tr>
              </thead>

              <tbody>
                {[
                  ["Vanilla Cupcake", "✔", "✔", "✔", "✔", "✖", "✖"],
                  ["Chocolate Cupcake", "✔", "✔", "✔", "✔", "✖", "✔"],
                  ["Red Velvet Cupcake", "✔", "✔", "✔", "✔", "✖", "✔"],
                  ["Floral Topping", "✔", "✔", "✖", "✔", "✖", "✖"],
                ].map((row, i) => (
                  <tr key={i} className="border-b">
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
        <section className="bg-white rounded-2xl shadow p-6 space-y-3">
          <h2 className="text-xl font-semibold">
            Ingredient Notes
          </h2>

          <p className="text-gray-600">
            • All cupcakes contain wheat, eggs, and dairy as part of the base recipe.
          </p>

          <p className="text-gray-600">
            • Chocolate and red velvet varieties may contain soy-based ingredients.
          </p>

          <p className="text-gray-600">
            • Floral designs use edible sugar decorations and dairy-based frosting.
          </p>
        </section>

        {/* =========================
            CROSS CONTAMINATION
        ========================== */}
        <section className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <h2 className="text-xl font-semibold">
            Cross-Contamination Notice
          </h2>

          <p className="text-gray-700 mt-2">
            All products are prepared in a shared kitchen environment where
            trace amounts of nuts, dairy, wheat, and soy may be present.
          </p>
        </section>

        {/* =========================
            CONTACT CTA
        ========================== */}
        <section className="text-center space-y-4">
          <h2 className="text-xl font-semibold">
            Need Help With Allergies?
          </h2>

          <p className="text-gray-600">
            Contact us before ordering and we’ll help you choose safely.
          </p>

          <MotionLink
            to="/contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="inline-block bg-pink-500 text-white px-6 py-2 rounded-xl hover:bg-pink-600"
          >
            Contact Us
          </MotionLink>
        </section>

      </div>
    </div>
  );
}