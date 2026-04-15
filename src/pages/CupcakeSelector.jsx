import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const MotionLink = motion(Link);

import vanilla from "../assets/vanilla.png";
import chocolate from "../assets/chocolate.png";
import redVelvet from "../assets/redvelvet.png";
import classicFrosting from "../assets/classic_frosting.png";
import floralFrosting from "../assets/floral_frosting.png";

const cupcakes = [
  { id: "vanilla", name: "Vanilla", image: vanilla, price: 0 },
  { id: "chocolate", name: "Chocolate", image: chocolate, price: 0 },
  { id: "redVelvet", name: "Red Velvet", image: redVelvet, price: 2 },
];

const frostings = [
  { id: "classic", name: "Classic", image: classicFrosting, price: 0 },
  { id: "floral", name: "Floral", image: floralFrosting, price: 2 },
];

export default function CupcakeSelector({ darkMode }) {
  const [selectedCupcake, setSelectedCupcake] = useState("vanilla");
  const [selectedFrosting, setSelectedFrosting] = useState("classic");

  const cupcake = cupcakes.find((c) => c.id === selectedCupcake);
  const frosting = frostings.find((f) => f.id === selectedFrosting);
  const totalPrice = 3 + cupcake.price + frosting.price;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${
      darkMode ? "from-gray-900 to-gray-800" : "from-pink-50 to-rose-100"
    }`}>
      <div className="mx-auto max-w-4xl p-4">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${
            darkMode ? "text-pink-400" : "text-pink-600"
          }`}>Create Your Cupcake</h1>
          <p className={darkMode ? "text-gray-400" : "text-gray-600"}>Mix and match flavors and frostings</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Side: Preview */}
          <div className={`rounded-3xl p-4 md:p-8 shadow-xl ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}>
            <h2 className={`text-xl md:text-2xl font-semibold text-center mb-4 md:mb-6 ${
              darkMode ? "text-gray-100" : "text-gray-800"
            }`}>Your Cupcake</h2>
            <div className="relative w-full max-w-[12rem] md:max-w-sm mx-auto aspect-square mb-4 md:mb-6">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedCupcake}
                  src={cupcake.image}
                  alt={cupcake.name}
                  className="absolute inset-0 w-full h-full object-contain"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedFrosting}
                  src={frosting.image}
                  alt={frosting.name}
                  className="absolute inset-0 w-full h-full object-contain"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
            </div>
            <div className="text-center">
              <p className={`text-base md:text-lg font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                {cupcake.name} with {frosting.name} Frosting
              </p>
              <p className={`text-xl md:text-2xl font-bold mt-2 ${darkMode ? "text-pink-400" : "text-pink-600"}`}>${totalPrice} CAD</p>
            </div>
          </div>

          {/* Right Side: Cupcake and Frosting Selections */}
          <div className="space-y-6 md:space-y-8">
            {/* Cupcake Selection */}
            <div className={`rounded-3xl p-4 md:p-6 shadow-xl ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <h3 className={`text-lg md:text-xl font-semibold mb-3 md:mb-4 ${darkMode ? "text-gray-100" : "text-gray-800"}`}>Choose Your Cupcake</h3>
              <div className="grid grid-cols-1 gap-3 md:gap-4">
                {cupcakes.map((cupcake) => (
                  <button
                    key={cupcake.id}
                    onClick={() => setSelectedCupcake(cupcake.id)}
                    className={`flex items-center p-3 md:p-4 rounded-2xl border-2 transition-all ${
                      selectedCupcake === cupcake.id
                        ? darkMode ? "border-pink-400 bg-gray-700" : "border-pink-400 bg-pink-50"
                        : darkMode ? "border-gray-600 hover:border-pink-400" : "border-gray-200 hover:border-pink-300"
                    }`}
                  >
                    <img
                      src={cupcake.image}
                      alt={cupcake.name}
                      className="w-12 h-12 md:w-16 md:h-16 object-contain mr-3 md:mr-4"
                    />
                    <div className="text-left">
                      <p className={`font-medium text-sm md:text-base ${darkMode ? "text-gray-100" : "text-gray-800"}`}>{cupcake.name}</p>
                      {cupcake.price > 0 && (
                        <p className={`text-xs md:text-sm ${darkMode ? "text-pink-400" : "text-pink-600"}`}>+${cupcake.price} CAD</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Frosting Selection */}
            <div className={`rounded-3xl p-4 md:p-6 shadow-xl ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <h3 className={`text-lg md:text-xl font-semibold mb-3 md:mb-4 ${darkMode ? "text-gray-100" : "text-gray-800"}`}>Choose Your Frosting</h3>
              <div className="grid grid-cols-1 gap-3 md:gap-4">
                {frostings.map((frosting) => (
                  <button
                    key={frosting.id}
                    onClick={() => setSelectedFrosting(frosting.id)}
                    className={`flex items-center p-3 md:p-4 rounded-2xl border-2 transition-all ${
                      selectedFrosting === frosting.id
                        ? darkMode ? "border-pink-400 bg-gray-700" : "border-pink-400 bg-pink-50"
                        : darkMode ? "border-gray-600 hover:border-pink-400" : "border-gray-200 hover:border-pink-300"
                    }`}
                  >
                    <img
                      src={frosting.image}
                      alt={frosting.name}
                      className="w-12 h-12 md:w-16 md:h-16 object-contain mr-3 md:mr-4"
                    />
                    <div className="text-left">
                      <p className={`font-medium text-sm md:text-base ${darkMode ? "text-gray-100" : "text-gray-800"}`}>{frosting.name}</p>
                      {frosting.price > 0 && (
                        <p className={`text-xs md:text-sm ${darkMode ? "text-pink-400" : "text-pink-600"}`}>+${frosting.price} CAD</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Order Button at Bottom */}
        <div className={`mt-6 md:mt-8 rounded-3xl p-4 md:p-6 shadow-xl text-center ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <p className={`mb-3 md:mb-4 text-sm md:text-base ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Ready to order? Contact us to place your custom cupcake order!</p>
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
        </div>
      </div>
    </div>
  );
}