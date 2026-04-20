import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useCart } from "../contexts/CartContext";

export default function Navbar({ darkMode, toggleDarkMode }) {
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
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
    { name: "Cart", to: "/cart" }, // Fixed to point to order
    { name: "Allergens", to: "/alergen-info" },
    { name: "Contact", to: "/contact" },
  ];

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? darkMode
            ? "bg-gray-900/90 backdrop-blur-md shadow-lg"
            : "bg-white/90 backdrop-blur-md shadow-md"
          : darkMode
            ? "bg-gray-900/70 backdrop-blur-sm"
            : "bg-white/70 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Main Flex Container: Changed justify-between to keep items balanced */}
        <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? "h-14" : "h-20"}`}>

          {/* LEFT: Logo Section */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className={`text-2xl font-black tracking-tighter ${
                darkMode ? "text-pink-400" : "text-pink-500"
              }`}
            >
            <span className={darkMode ? "text-white" : "text-gray-900"}>BLOOMS CUPCAKES</span>
            </Link>
          </div>

          {/* CENTER: Desktop Nav links - Absolute centering for perfect alignment */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {({ isActive }) => (
                  <motion.span
                    whileHover={{ y: -2 }}
                    className={`relative cursor-pointer text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${
                      isActive
                        ? darkMode ? "text-pink-400" : "text-pink-500"
                        : darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-pink-500"
                    }`}
                  >
                    {item.name}
                    {isActive && (
                      <motion.div 
                        layoutId="nav-underline"
                        className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-pink-500"
                      />
                    )}
                  </motion.span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className={`text-lg p-2 rounded-full transition ${
                darkMode ? "bg-gray-800 text-yellow-300" : "bg-gray-100 text-gray-600"
              }`}
            >
              {darkMode ? "☀️" : "🌙"}
            </motion.button>

            {/* CART ICON */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
              <Link
                to="/cart"
                className={`group relative flex items-center justify-center p-2.5 rounded-full transition-all duration-300 ${
                  darkMode
                    ? "bg-gray-800 text-pink-400 hover:bg-gray-700"
                    : "bg-pink-50 text-pink-500 hover:bg-pink-100"
                }`}
              >
                <AiOutlineShoppingCart className="text-2xl transition-transform group-hover:-rotate-12" />
                
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-1 -right-1 flex h-5 w-5"
                    >
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                      <span className={`relative inline-flex items-center justify-center rounded-full h-5 w-5 text-[10px] font-black text-white shadow-sm ring-2 ${
                        darkMode ? "ring-gray-900 bg-pink-500" : "ring-white bg-pink-600"
                      }`}>
                        {cartCount > 99 ? "99+" : cartCount}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setOpen(!open)}
              className={`md:hidden p-2 text-2xl transition-colors ${darkMode ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-pink-500"}`}
            >
              {open ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden border-t overflow-hidden ${
              darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"
            }`}
          >
            <div className="flex flex-col p-6 gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`text-lg font-bold transition-colors ${
                    darkMode ? "text-gray-300 hover:text-pink-400" : "text-gray-600 hover:text-pink-500"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}