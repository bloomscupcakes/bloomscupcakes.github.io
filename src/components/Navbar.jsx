import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ darkMode, toggleDarkMode }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { name: "Home", to: "/" },
    { name: "Gallery", to: "/gallery" },
    { name: "Order Now", to: "/order" },
    { name: "Allergen Info", to: "/alergen-info" },
    { name: "Contact Us", to: "/contact" },
  ];

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`sticky top-0 z-50 transition-all ${
        scrolled
          ? darkMode
            ? "bg-gray-900/90 backdrop-blur-md shadow-md"
            : "bg-white/90 backdrop-blur-md shadow-md"
          : darkMode
            ? "bg-gray-900/70 backdrop-blur-sm"
            : "bg-white/70 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className={`flex items-center transition-all ${scrolled ? "h-14" : "h-16"}`}>

          {/* LEFT: Logo */}
          <Link
            to="/"
            className={`text-2xl font-extrabold mr-8 ${
              darkMode ? "text-pink-400" : "text-pink-500"
            }`}
          >
            Blooms Cupcakes
          </Link>

          {/* CENTER-LEFT: Nav links */}
          <nav className="hidden md:flex items-center gap-6 flex-1">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {({ isActive }) => (
                  <motion.span
                    whileHover={{ scale: 1.1 }}
                    className={`cursor-pointer transition ${
                      isActive
                        ? darkMode
                          ? "text-pink-400 font-semibold"
                          : "text-pink-500 font-semibold"
                        : darkMode
                          ? "text-gray-300 hover:text-pink-400"
                          : "text-gray-700 hover:text-pink-500"
                    }`}
                  >
                    {item.name}
                  </motion.span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* RIGHT: CTA and Dark Mode Toggle */}
          <div className="hidden md:flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className={`text-2xl p-2 rounded-lg transition ${
                darkMode
                  ? "bg-gray-800 text-yellow-300"
                  : "bg-gray-100 text-gray-700"
              }`}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? "☀️" : "🌙"}
            </motion.button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/order"
                className={`px-4 py-2 rounded-xl shadow transition ${
                  darkMode
                    ? "bg-pink-600 text-white hover:bg-pink-700"
                    : "bg-pink-500 text-white hover:bg-pink-600"
                }`}
              >
                Pre Order Now
              </Link>
            </motion.div>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden ml-auto flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className={`text-2xl p-2 rounded-lg transition ${
                darkMode
                  ? "bg-gray-800 text-yellow-300"
                  : "bg-gray-100 text-gray-700"
              }`}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? "☀️" : "🌙"}
            </motion.button>
            <button
              onClick={() => setOpen(!open)}
              className={`text-2xl ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`md:hidden overflow-hidden shadow-md ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex flex-col items-start px-6 py-4 gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`transition ${
                    darkMode
                      ? "text-gray-300 hover:text-pink-400"
                      : "text-gray-700 hover:text-pink-500"
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              <Link
                to="/order"
                onClick={() => setOpen(false)}
                className={`px-4 py-2 rounded-xl transition ${
                  darkMode
                    ? "bg-pink-600 text-white hover:bg-pink-700"
                    : "bg-pink-500 text-white hover:bg-pink-600"
                }`}
              >
                Pre Order Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}