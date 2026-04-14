import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
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
    { name: "Contact Us", to: "/contact" },
  ];

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`sticky top-0 z-50 transition-all ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-md"
          : "bg-white/70 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className={`flex items-center transition-all ${scrolled ? "h-14" : "h-16"}`}>

          {/* LEFT: Logo */}
          <Link
            to="/"
            className="text-2xl font-extrabold text-pink-500 mr-8"
          >
            Blooms Cupcakes 🧁
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
                        ? "text-pink-500 font-semibold"
                        : "text-gray-700 hover:text-pink-500"
                    }`}
                  >
                    {item.name}
                  </motion.span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* RIGHT: CTA */}
          <div className="hidden md:flex items-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/order"
                className="bg-pink-500 text-white px-4 py-2 rounded-xl shadow hover:bg-pink-600 transition"
              >
                Order Now
              </Link>
            </motion.div>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden ml-auto text-gray-700 text-2xl"
          >
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white overflow-hidden shadow-md"
          >
            <div className="flex flex-col items-start px-6 py-4 gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="text-gray-700 hover:text-pink-500"
                >
                  {item.name}
                </Link>
              ))}

              <Link
                to="/order"
                onClick={() => setOpen(false)}
                className="bg-pink-500 text-white px-4 py-2 rounded-xl"
              >
                Order Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}