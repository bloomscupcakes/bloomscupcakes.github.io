import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import vanilla from "../assets/vanilla.png";
import chocolate from "../assets/chocolate.png";
import redVelvet from "../assets/redvelvet.png";
import customOrder from "../assets/custom_order.jpeg";
import { trackEvent } from "../utils/analytics";
import { PRODUCTS, FLAVOURS, reviews } from "../utils/config";
import Loader from "../components/Loader";
import ProductGrid from "../components/ProductGrid";

/* Load all images from gallery folder */
const images = import.meta.glob("../gallery/*.{jpg,jpeg,png}", {
  eager: true,
  import: "default",
});

const imageList = Object.values(images);


export default function Home({ darkMode }) {
  const [heroImg, setHeroImg] = useState(null);
  const [heroLoading, setHeroLoading] = useState(true);

  /* Out Gallery section data */
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [galleryLoading, setGalleryLoading] = useState([true, true, true, true]);

  const [packsLoading, setPacksLoading] = useState([true, true, true, true]);
  const [flavoursLoading, setFlavoursLoading] = useState([true, true, true]);

  const isOpen = selectedIndex !== null;

  const close = () => setSelectedIndex(null);

  const next = () =>
    setSelectedIndex((prev) => (prev + 1) % imageList.length);

  const prev = () =>
    setSelectedIndex((prev) =>
      prev === 0 ? imageList.length - 1 : prev - 1
    );


  /* Pick random cover image once */
  useEffect(() => {
    if (imageList.length > 0) {
      const random =
        imageList[Math.floor(Math.random() * imageList.length)];
      setHeroImg(random);
      setHeroLoading(false);
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
            <img 
              src={heroImg} 
              className="w-full h-full object-cover" 
              onLoad={() => setHeroLoading(false)}
              onError={() => setHeroLoading(false)}
            />
            <div className="absolute inset-0 bg-pink-500/20" />
          </motion.div>
        )}

        {heroLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader type="cupcake" size="xl" />
          </div>
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
              onClick={() => setSelectedIndex(i)}
              className={`rounded-2xl overflow-hidden shadow-md cursor-pointer relative ${darkMode
                ? "bg-gray-800 border border-pink-700"
                : "bg-white border border-[#F7B2C4]"
                }`}
            >
              {galleryLoading[i] && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <Loader type="image" size="large" />
                </div>
              )}
              <img 
                src={img} 
                className="h-64 w-full object-cover" 
                onLoad={() => {
                  setGalleryLoading(prev => {
                    const newLoading = [...prev];
                    newLoading[i] = false;
                    return newLoading;
                  });
                }}
                onError={() => {
                  setGalleryLoading(prev => {
                    const newLoading = [...prev];
                    newLoading[i] = false;
                    return newLoading;
                  });
                }}
              />
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

      {/* ================= OUR CUPCAKES ================= */}
      <section className="px-4 sm:px-6 py-12">
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
            className={`flex items-center gap-4 p-3 rounded-xl shadow relative ${darkMode
              ? "bg-gray-800 border border-pink-700 text-white"
              : "bg-white border border-pink-200 text-gray-800"
              }`}
          >
            {flavoursLoading[0] && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
                <Loader type="image" size="small" />
              </div>
            )}
            <img
              src={vanilla}
              className="w-16 h-16 object-cover rounded-lg"
              alt="Vanilla Cupcake"
              onLoad={() => {
                setFlavoursLoading(prev => {
                  const newLoading = [...prev];
                  newLoading[0] = false;
                  return newLoading;
                });
              }}
              onError={() => {
                setFlavoursLoading(prev => {
                  const newLoading = [...prev];
                  newLoading[0] = false;
                  return newLoading;
                });
              }}
            />
            <h4 className="font-semibold">Vanilla</h4>
          </motion.div>

          {/* Chocolate */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            className={`flex items-center gap-4 p-3 rounded-xl shadow relative ${darkMode
              ? "bg-gray-800 border border-pink-700 text-white"
              : "bg-white border border-pink-200 text-gray-800"
              }`}
          >
            {flavoursLoading[1] && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
                <Loader type="image" size="small" />
              </div>
            )}
            <img
              src={chocolate}
              className="w-16 h-16 object-cover rounded-lg"
              alt="Chocolate Cupcake"
              onLoad={() => {
                setFlavoursLoading(prev => {
                  const newLoading = [...prev];
                  newLoading[1] = false;
                  return newLoading;
                });
              }}
              onError={() => {
                setFlavoursLoading(prev => {
                  const newLoading = [...prev];
                  newLoading[1] = false;
                  return newLoading;
                });
              }}
            />
            <h4 className="font-semibold">Chocolate</h4>
          </motion.div>

          {/* Red Velvet */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            className={`flex items-center gap-4 p-3 rounded-xl shadow relative ${darkMode
              ? "bg-gray-800 border border-pink-700 text-white"
              : "bg-white border border-pink-200 text-gray-800"
              }`}
          >
            {flavoursLoading[2] && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
                <Loader type="image" size="small" />
              </div>
            )}
            <img
              src={redVelvet}
              className="w-16 h-16 object-cover rounded-lg"
              alt="Red Velvet Cupcake"
              onLoad={() => {
                setFlavoursLoading(prev => {
                  const newLoading = [...prev];
                  newLoading[2] = false;
                  return newLoading;
                });
              }}
              onError={() => {
                setFlavoursLoading(prev => {
                  const newLoading = [...prev];
                  newLoading[2] = false;
                  return newLoading;
                });
              }}
            />
            <div>
              <h4 className="font-semibold">Red Velvet</h4>
            </div>
          </motion.div>
        </div>

        {/* ===== PACK SIZES ===== */}
        <h2
          className={`text-3xl font-bold text-center mb-10 ${darkMode ? "text-pink-400" : "text-pink-600"
            }`}
        >
          Our Products
        </h2>

        {/* PRODUCT GRID */}
        <ProductGrid darkMode={darkMode} />




        {/* ===== PACK INFO ===== */}
        <div className="text-center mb-8">
          <p
            className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-700"
              }`}
          >
            Customise your order in cart page.
          </p>
        </div>

        {/* ===== PRIMARY CTA ===== */}
        <div className="text-center mb-12">
          <Link
            to="/cart"
            onClick={() =>
              trackEvent("cta_click_order", {
                location: "pack_infosection",
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
                onClick={() => {
                  trackEvent("cta_click_order", {
                    location: "custom_order_section",
                  });
                  trackEvent("generate_lead", { type: "custom_inquiry" }, true);
                }
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
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={close}
        >
          {/* Image */}
          <img
            src={imageList[selectedIndex]}
            className="max-w-[90%] max-h-[80%] rounded-xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Close */}
          <button
            onClick={close}
            className="absolute top-6 right-6 text-white text-3xl"
          >
            ✕
          </button>

          {/* Prev */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-6 text-white text-4xl"
          >
            ‹
          </button>

          {/* Next */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-6 text-white text-4xl"
          >
            ›
          </button>

          {/* CTA inside modal */}
          <div className="absolute bottom-10 w-full flex justify-center">
            <Link
              to="/gallery"
              onClick={(e) => {
                e.stopPropagation();
                trackEvent("cta_click_gallery_modal");
              }}
              className="px-6 py-3 bg-pink-600 text-white rounded-xl shadow-lg hover:bg-pink-700 transition"
            >
              View Full Gallery
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}