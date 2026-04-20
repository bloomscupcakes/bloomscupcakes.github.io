import { Link } from "react-router-dom";
import { FaPhoneAlt, FaInstagram } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { motion } from "framer-motion";


export default function Footer({ darkMode }) {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className={`border-t mt-16 transition ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white"
        }`}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } },
          }}
          className="grid md:grid-cols-3 gap-8"
        >

          {/* Brand */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <h2 className={`text-xl font-bold ${darkMode ? "text-pink-400" : "text-pink-500"
              }`}>
              Blooms Cupcakes
            </h2>

            <p className={`mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"
              }`}>
              Freshly baked cupcakes made with love for every occasion.
            </p>
            <div className={`text-sm mt-4 ${darkMode ? "text-gray-500" : "text-gray-500"
              }`}>
              <Link to="/terms-and-conditions" className={`transition ${darkMode ? "hover:text-pink-400" : "hover:text-pink-500"
                }`}>Terms & Conditions</Link>
            </div>
            <div className={`text-sm mt-4 ${darkMode ? "text-gray-500" : "text-gray-500"
              }`}>
              <Link to="/showorders" className={`transition ${darkMode ? "hover:text-pink-400" : "hover:text-pink-500"
                }`}>Admin page</Link>
            </div>
          </motion.div>

          {/* Links */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <h3 className={`font-semibold mb-3 ${darkMode ? "text-gray-200" : "text-gray-800"
              }`}>Quick Links</h3>
            <ul className={`space-y-2 ${darkMode ? "text-gray-400" : "text-gray-600"
              }`}>
              <li><Link to="/" className={`transition ${darkMode ? "hover:text-pink-400" : "hover:text-pink-500"
                }`}>Home</Link></li>
              <li><Link to="/cart" className={`transition ${darkMode ? "hover:text-pink-400" : "hover:text-pink-500"
                }`}>Order</Link></li>
              <li><Link to="/contact" className={`transition ${darkMode ? "hover:text-pink-400" : "hover:text-pink-500"
                }`}>Contact</Link></li>
              <li><Link to="/alergen-info" className={`transition ${darkMode ? "hover:text-pink-400" : "hover:text-pink-500"
                }`}>Allergen Info</Link></li>
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <h3 className={`font-semibold mb-3 ${darkMode ? "text-gray-200" : "text-gray-800"
              }`}>Contact</h3>
            {/* Instagram */}
            <a
              href="https://www.instagram.com/bloomscupcakes.ca"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 mt-4 transition ${darkMode
                  ? "text-pink-400 hover:text-pink-300"
                  : "text-pink-500 hover:text-pink-600"
                }`}
            >
              <FaInstagram size={18} />
              Instagram: @bloomscupcakes.ca
            </a>
            <a
              href="mailto:bloomscupcakes@gmail.com"
              className={`inline-flex items-center gap-2 transition ${darkMode
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-grey-500 hover:text-grey-600"
                }`}
            >
              <SiGmail size={18} />
              Email: bloomscupcakes@gmail.com
            </a>
            <a
              href="tel:3439879593"
              className={`inline-flex items-center gap-2 transition ${darkMode
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-grey-500 hover:text-grey-600"
                }`}
            >
              <FaPhoneAlt size={16} />
              (343) 987-9593
            </a>
          </motion.div>

        </motion.div>

        <div className={`text-center mt-10 text-sm ${darkMode ? "text-gray-500" : "text-gray-400"
          }`}>
          © {new Date().getFullYear()} Blooms Cupcakes. All rights reserved.
        </div>
      </div>
    </motion.footer>
  );
}