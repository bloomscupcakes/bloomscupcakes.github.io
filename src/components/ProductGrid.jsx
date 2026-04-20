// components/ProductGrid.js
import { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { PRODUCTS, FLAVOURS } from "../utils/config";
import { motion } from "framer-motion";

export default function ProductGrid({ darkMode }) {
  const { addItem } = useCart();
  const [selectedPack, setSelectedPack] = useState({}); // Stores selected size per product
  const [selectedFlavour, setSelectedFlavour] = useState({}); // Stores selected flavour per product
  const [toast, setToast] = useState(null);

  const handleAddToCart = (product) => {
    const sizeInfo = selectedPack[product.id] || product.packSizes[0];
    const flavourInfo = selectedFlavour[product.id] || FLAVOURS[0];
    
    addItem({
      id: product.id,
      title: product.title,
      selectedPackSize: parseInt(sizeInfo.name.split(' ')[0]),
      selectedFlavour: flavourInfo.label,
      quantity: 1
    });
    setToast(`Added ${product.title} (${sizeInfo.name}, ${flavourInfo.label}) to cart!`);
    setTimeout(() => setToast(null), 3000);
  };

  const getPrice = (product) => {
    const sizeInfo = selectedPack[product.id] || product.packSizes[0];
    const flavourInfo = selectedFlavour[product.id] || FLAVOURS[0];
    return sizeInfo.price + flavourInfo.extra;
  };

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
        {PRODUCTS.map((product) => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`rounded-3xl overflow-hidden shadow-lg border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-pink-100"}`}
          >
            <img src={product.packSizes[0].img} alt={product.title} className="w-full h-64 object-cover" />
            
            <div className="p-6">
              <h3 className={`text-xl font-black mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>{product.title}</h3>
              
              {/* Pack Size Selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {product.packSizes.map((ps) => (
                  <button
                    key={ps.name}
                    onClick={() => setSelectedPack({ ...selectedPack, [product.id]: ps })}
                    className={`px-3 py-1 text-xs font-bold rounded-full border transition-all ${
                      (selectedPack[product.id]?.name === ps.name || (!selectedPack[product.id] && product.packSizes[0].name === ps.name))
                      ? "bg-pink-500 border-pink-500 text-white"
                      : darkMode ? "border-gray-600 text-gray-400 hover:border-gray-500" : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {ps.name}
                  </button>
                ))}
              </div>

              {/* Flavour Selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {FLAVOURS.map((fl) => (
                  <button
                    key={fl.label}
                    onClick={() => setSelectedFlavour({ ...selectedFlavour, [product.id]: fl })}
                    className={`px-3 py-1 text-xs font-bold rounded-full border transition-all ${
                      (selectedFlavour[product.id]?.label === fl.label || (!selectedFlavour[product.id] && FLAVOURS[0].label === fl.label))
                      ? "bg-pink-500 border-pink-500 text-white"
                      : darkMode ? "border-gray-600 text-gray-400 hover:border-gray-500" : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {fl.label} {fl.extra > 0 && `+$${fl.extra}`}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mt-6">
                <span className={`text-2xl font-black ${darkMode ? "text-pink-400" : "text-pink-600"}`}>
                  ${getPrice(product).toFixed(2)}
                </span>
                <button 
                  onClick={() => handleAddToCart(product)}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-transform active:scale-95"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
        >
          {toast}
        </motion.div>
      )}
    </div>
  );
}