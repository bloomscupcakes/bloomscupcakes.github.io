import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import CupcakeBuilder from "./CupcakeSelector";

import vanilla from "../assets/vanilla.png";
import chocolate from "../assets/chocolate.png";
import redVelvet from "../assets/redvelvet.png";
import classicFrosting from "../assets/six_pack_classic.jpeg";
import floralFrosting from "../assets/six_pack_floral.jpeg";
import customOrder from "../assets/custom_order.jpeg";
import { trackEvent } from "../utils/analytics";

/* Load all images from gallery */
const images = import.meta.glob("../gallery/*.{jpg,jpeg,png}", {
  eager: true,
  import: "default",
});

const imageList = Object.values(images);

/* Fake reviews */
const reviews = [
  {
    name: "Sueda M.",
    text: "The Cupcakes look so beautiful I almost didn’t want to eat them.",
  },
  {
    name: "James K.",
    text: "Ordered for a birthday — everyone loved them!",
  },
  {
    name: "Emily R.",
    text: "So cute and tasty. You can tell they’re made with love 🧁",
  },
];

export default function Home({ darkMode }) {
  const [heroImg, setHeroImg] = useState(null);

  /* Pick random cover image once */
  useEffect(() => {
    if (imageList.length > 0) {
      const random =
        imageList[Math.floor(Math.random() * imageList.length)];
      setHeroImg(random);
    }
  }, []);

  return (
    <div className={darkMode ? "bg-gray-900" : "bg-gray-50"}>

      {/* ================= HERO ================= */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative text-center flex flex-col items-center justify-center py-16 overflow-hidden"
      >
        {heroImg && (
          <motion.div
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.35 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <img src={heroImg} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-pink-500/20" />
          </motion.div>
        )}

        <div className="relative z-10">
          <h1 className={`text-6xl font-extrabold mb-4 ${darkMode ? "text-pink-400" : "text-pink-600"
            }`}>
            Welcome to Blooms Cupcakes
          </h1>

          <p className={`max-w-xl mx-auto mb-6 text-lg ${darkMode ? "text-gray-300" : "text-gray-700"
            }`}>
            Freshly baked cupcakes made with love, creativity, and happiness.
          </p>

          <Link
            to="/order"
            onClick={() =>
              trackEvent("cta_click_order", {
                location: "hero_section",
              })
            }
            className={`px-8 py-3 rounded-xl shadow-lg transition hover:scale-105 ${darkMode
                ? "bg-pink-600 text-white hover:bg-pink-700"
                : "bg-pink-500 text-white hover:bg-pink-600"
              }`}
          >
            Order Now
          </Link>
        </div>
      </motion.section>


      {/* ================= Our Gallery ================= */}
      <section className="px-4 sm:px-6 py-8">
        <h2 className={`text-3xl font-bold text-center mb-6 ${darkMode ? "text-pink-400" : "text-pink-600"
          }`}>Our Gallery</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {imageList.slice(0, 4).map((img, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className={`rounded-2xl overflow-hidden shadow-md ${darkMode
                  ? "bg-gray-800 border border-pink-700"
                  : "bg-white border border-[#F7B2C4]"
                }`}
            >
              <img src={img} className="h-64 w-full object-cover" />
            </motion.div>
          ))}
        </div>
        <div className="flex justify-center mt-6">
          <Link
            to="/gallery"
            className={`px-6 py-3 rounded-xl font-semibold shadow-md transition hover:scale-105 ${darkMode
                ? "bg-pink-700 text-white hover:bg-pink-800"
                : "bg-[#E85D75] text-white hover:bg-[#d94f68]"
              }`}
          >
            View Full Gallery
          </Link>
        </div>
      </section>

      {/* <CupcakeBuilder darkMode={darkMode} /> */}
      {/* ================= OUR CUPCAKES ================= */}
      <section className="px-4 sm:px-6 py-12">
        <h2
          className={`text-3xl font-bold text-center mb-10 ${darkMode ? "text-pink-400" : "text-pink-600"
            }`}
        >
          Our packs & flavours
        </h2>

        {/* ===== PACK TYPES ===== */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Classic Pack */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`rounded-2xl overflow-hidden shadow-lg ${darkMode
                ? "bg-gray-800 border border-pink-700 text-white"
                : "bg-white border border-pink-200 text-gray-800"
              }`}
          >
            <img
              src={classicFrosting}
              className="h-56 w-full object-cover"
              alt="Classic Cupcakes"
            />
            <div className="p-5 text-center">
              <h4 className="text-xl font-bold mb-2">
                6 Pack Classic Cupcakes
              </h4>
              <p
                className={`text-lg font-semibold ${darkMode ? "text-pink-400" : "text-pink-500"
                  }`}
              >
                $20 CAD
              </p>
            </div>
          </motion.div>

          {/* Floral Pack */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`rounded-2xl overflow-hidden shadow-lg ${darkMode
                ? "bg-gray-800 border border-pink-700 text-white"
                : "bg-white border border-pink-200 text-gray-800"
              }`}
          >
            <img
              src={floralFrosting}
              className="h-56 w-full object-cover"
              alt="Floral Cupcakes"
            />
            <div className="p-5 text-center">
              <h4 className="text-xl font-bold mb-2">
                6 Pack Floral Cupcakes
              </h4>
              <p
                className={`text-lg font-semibold ${darkMode ? "text-pink-400" : "text-pink-500"
                  }`}
              >
                $30 CAD
              </p>
            </div>
          </motion.div>
        </div>

        {/* ===== FLAVOURS ===== */}
        <h3
          className={`text-xl font-semibold text-center mb-6 ${darkMode ? "text-gray-300" : "text-gray-700"
            }`}
        >
          Available Flavours
        </h3>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
          {/* Vanilla */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            className={`flex items-center gap-4 p-3 rounded-xl shadow ${darkMode
                ? "bg-gray-800 border border-pink-700 text-white"
                : "bg-white border border-pink-200 text-gray-800"
              }`}
          >
            <img
              src={vanilla}
              className="w-16 h-16 object-cover rounded-lg"
              alt="Vanilla Cupcake"
            />
            <h4 className="font-semibold">Vanilla</h4>
          </motion.div>

          {/* Chocolate */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            className={`flex items-center gap-4 p-3 rounded-xl shadow ${darkMode
                ? "bg-gray-800 border border-pink-700 text-white"
                : "bg-white border border-pink-200 text-gray-800"
              }`}
          >
            <img
              src={chocolate}
              className="w-16 h-16 object-cover rounded-lg"
              alt="Chocolate Cupcake"
            />
            <h4 className="font-semibold">Chocolate</h4>
          </motion.div>

          {/* Red Velvet */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            className={`flex items-center gap-4 p-3 rounded-xl shadow ${darkMode
                ? "bg-gray-800 border border-pink-700 text-white"
                : "bg-white border border-pink-200 text-gray-800"
              }`}
          >
            <img
              src={redVelvet}
              className="w-16 h-16 object-cover rounded-lg"
              alt="Red Velvet Cupcake"
            />
            <div>
              <h4 className="font-semibold">Red Velvet</h4>
              <p
                className={`text-sm ${darkMode ? "text-pink-400" : "text-pink-500"
                  }`}
              >
                +$2 CAD
              </p>
            </div>
          </motion.div>
        </div>
        {/* ===== PACK INFO ===== */}
        <div className="text-center mb-8">
          <p
            className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-700"
              }`}
          >
            Mix & match flavours in packs of{" "}
            <span className="font-semibold">4, 6, or 12</span> cupcakes
          </p>
        </div>

        {/* ===== PRIMARY CTA ===== */}
        <div className="text-center mb-12">
          <Link
            to="/order"
            onClick={() =>
              trackEvent("cta_click_order", {
                location: "pack_info_section",
              })
            }
            className={`inline-block px-10 py-4 text-lg rounded-xl font-semibold shadow-lg transition hover:scale-105 ${darkMode
                ? "bg-pink-600 text-white hover:bg-pink-700"
                : "bg-pink-500 text-white hover:bg-pink-600"
              }`}
          >
            Customize & Order
          </Link>
        </div>

        {/* ===== CUSTOM ORDER CARD ===== */}
        <div className="max-w-3xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.03 }}
            className={`rounded-2xl overflow-hidden shadow-lg ${darkMode
                ? "bg-gray-800 border border-pink-700 text-white"
                : "bg-white border border-pink-200 text-gray-800"
              }`}
          >
            <img
              src={customOrder}
              className="h-56 w-full object-cover"
              alt="Custom Cupcakes"
            />

            <div className="p-6 text-center">
              <h4 className="text-xl font-bold mb-2">
                Need Something Custom?
              </h4>

              <p
                className={`mb-5 ${darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
              >
                Special designs, themes, birthdays, or bulk orders — we can create something just for you.
              </p>

              <Link
                to="/contact"
                onClick={() =>
                  trackEvent("cta_click_order", {
                    location: "custom_order_section",
                  })
                }

                className={`inline-block px-6 py-2 rounded-lg font-medium border transition hover:scale-105 ${darkMode
                    ? "border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-white"
                    : "border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white"
                  }`}
              >
                Request Custom Order
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= REVIEWS ================= */}
      <section className="px-4 sm:px-6 py-8">
        <h2 className={`text-3xl font-bold text-center mb-6 ${darkMode ? "text-pink-400" : "text-pink-600"
          }`}>
          Loved by Customers
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`p-6 rounded-xl shadow ${darkMode ? "bg-gray-800 text-gray-300" : "bg-white text-gray-700"
                }`}
            >
              <p className="mb-4">"{r.text}"</p>
              <div className={`font-semibold ${darkMode ? "text-pink-400" : "text-pink-500"
                }`}>
                - {r.name}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= MAP ================= */}
      <section className="px-4 sm:px-6 py-8">
        <p className={`text-center mb-8 ${darkMode ? "text-gray-400" : "text-gray-600"
          }`}>
          Located in the Bayshore area of Ottawa — serving fresh cupcakes daily
        </p>

        <div className="flex justify-center">
          <iframe
            title="Bayshore Ottawa Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11215.417556220242!2d-75.81893407130953!3d45.351751537155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cce00dd61c7120b%3A0x75ba772f94a9382e!2sBayshore%2C%20Ottawa%2C%20ON!5e0!3m2!1sen!2sca!4v1776137349450!5m2!1sen!2sca"
            className={`w-full max-w-4xl h-[350px] rounded-2xl shadow-lg border ${darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            loading="lazy"
            style={{ border: 0 }}
            allowFullScreen
          />
        </div>
      </section>

    </div>
  );
}