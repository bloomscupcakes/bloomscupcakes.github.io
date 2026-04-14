import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import CupcakeBuilder from "./CupcakeSelector";

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

export default function Home() {
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
  <div className="bg-gray-50">

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
        <h1 className="text-6xl font-extrabold text-pink-600 mb-4">
          Welcome to Blooms Cupcakes 🧁
        </h1>

        <p className="text-gray-700 max-w-xl mx-auto mb-6 text-lg">
          Freshly baked cupcakes made with love, creativity, and happiness.
        </p>

        <Link
          to="/order"
          className="bg-pink-500 text-white px-8 py-3 rounded-xl shadow-lg hover:bg-pink-600 hover:scale-105 transition"
        >
          Order Now
        </Link>
      </div>
    </motion.section>


    {/* ================= TOP CUPCAKES ================= */}
    <section className="px-4 sm:px-6 py-8">
      <h2 className="text-3xl font-bold text-center mb-6 text-pink-600">Top Cupcakes</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {imageList.slice(0, 4).map((img, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="rounded-2xl overflow-hidden
            bg-white border border-[#F7B2C4] shadow-md"
          >
            <img src={img} className="h-64 w-full object-cover" />
          </motion.div>
        ))}
      </div>
      <div className="flex justify-center mt-6">
        <Link
          to="/gallery"
          className="px-6 py-3 rounded-xl font-semibold
          bg-[#E85D75] text-white
          shadow-md hover:bg-[#d94f68] hover:scale-105 transition"
        >
          View Full Gallery
        </Link>
      </div>
    </section>

    <CupcakeBuilder />

    {/* ================= REVIEWS ================= */}
    <section className="px-4 sm:px-6 py-8">
      <h2 className="text-3xl font-bold text-center mb-6 text-pink-600">
        Loved by Customers
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {reviews.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-6 rounded-xl shadow"
          >
            <p className="text-gray-700 mb-4">"{r.text}"</p>
            <div className="font-semibold text-pink-500">
              - {r.name}
            </div>
          </motion.div>
        ))}
      </div>
    </section>

    {/* ================= MAP ================= */}
    <section className="px-4 sm:px-6 py-8">
      <p className="text-center text-gray-600 mb-8">
        Located in the Bayshore area of Ottawa — serving fresh cupcakes daily 🧁
      </p>

      <div className="flex justify-center">
        <iframe
          title="Bayshore Ottawa Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11215.417556220242!2d-75.81893407130953!3d45.351751537155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cce00dd61c7120b%3A0x75ba772f94a9382e!2sBayshore%2C%20Ottawa%2C%20ON!5e0!3m2!1sen!2sca!4v1776137349450!5m2!1sen!2sca"
          className="w-full max-w-4xl h-[350px] rounded-2xl shadow-lg border"
          loading="lazy"
          style={{ border: 0 }}
          allowFullScreen
        />
      </div>
    </section>

  </div>
);
}