import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

import vanilla from "../assets/vanilla.png";
import chocolate from "../assets/chocolate.png";
import redVelvet from "../assets/redvelvet.png";
import classicFrosting from "../assets/classic_frosting.png";
import floralFrosting from "../assets/floral_frosting.png";

const MotionLink = motion(Link);

export default function CupcakeBuilder() {
  const [flavor, setFlavor] = useState("vanilla");
  const [design, setDesign] = useState("classic");

  const BASE_PRICE = 3;

  const price =
    BASE_PRICE +
    (flavor === "redVelvet" ? 2 : 0) +
    (design === "floral" ? 2 : 0);

  const baseImages = {
    vanilla,
    chocolate,
    redVelvet,
  };

  const toppingImages = {
    classic: classicFrosting,
    floral: floralFrosting,
  };

  const flavors = ["vanilla", "chocolate", "redVelvet"];
  const designs = ["classic", "floral"];

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="w-full max-w-5xl">

        {/* ================= GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch min-h-[520px]">

          {/* ================= LEFT PANEL ================= */}
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col h-full">

            {/* CUPCAKE CENTER (fixes empty bottom space) */}
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-72 h-72">

                <AnimatePresence mode="wait">
                  <motion.img
                    key={flavor}
                    src={baseImages[flavor]}
                    className="absolute w-full h-full object-contain"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  />
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.img
                    key={design}
                    src={toppingImages[design]}
                    className="absolute w-full h-full object-contain"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  />
                </AnimatePresence>

              </div>
            </div>

            {/* PRICE */}
            <div className="text-center text-xl font-semibold mt-4">
              Price: ${price} CAD
            </div>

            {/* CTA */}
            <div className="mt-auto pt-6 flex justify-center">
              <MotionLink
                to="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="bg-pink-500 text-white px-6 py-3 rounded-xl hover:bg-pink-600 text-center w-full"
              >
                Contact Us to Order
              </MotionLink>
            </div>

          </div>

          {/* ================= RIGHT PANEL ================= */}
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-8 h-full">

            <h2 className="text-3xl font-bold text-pink-600 text-center md:text-left">
              Cupcake Builder
            </h2>

            {/* FLAVOR */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Flavor</h3>

              <div className="grid grid-cols-3 gap-3">
                {flavors.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFlavor(f)}
                    className={`p-3 rounded-xl border bg-white transition hover:shadow ${
                      flavor === f ? "ring-2 ring-pink-400" : ""
                    }`}
                  >
                    <img
                      src={baseImages[f]}
                      className="w-full h-16 object-contain"
                    />
                    <div className="text-xs mt-1 capitalize">{f}</div>
                    {f === "redVelvet" && (
                      <div className="text-[10px] text-pink-500">+2 CAD</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* DESIGN */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Design</h3>

              <div className="grid grid-cols-2 gap-3">
                {designs.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDesign(d)}
                    className={`p-3 rounded-xl border bg-white transition hover:shadow ${
                      design === d ? "ring-2 ring-pink-400" : ""
                    }`}
                  >
                    <div className="h-16 flex items-center justify-center">
                      <img
                        src={toppingImages[d]}
                        className="h-full object-contain"
                      />
                    </div>

                    <div className="text-xs mt-1 capitalize">{d}</div>

                    {d === "floral" && (
                      <div className="text-[10px] text-pink-500">+2 CAD</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}