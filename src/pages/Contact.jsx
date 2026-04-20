import { motion } from "framer-motion";
import { FaPhoneAlt, FaInstagram } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { contactInfo } from "../utils/config";

const iconMap = {
  instagram: <FaInstagram size={18} />,
  email: <SiGmail size={18} />,
  phone: <FaPhoneAlt size={16} />,
};

export default function Contact({ darkMode }) {
  return (
    <div
      className={`min-h-screen px-4 sm:px-6 lg:px-8 py-12 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-[#FFF7F9] text-[#2B2B2B]"
      }`}
    >
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mx-auto mb-10"
      >
        <h1
          className={`text-4xl sm:text-5xl font-bold mb-3 ${
            darkMode ? "text-pink-400" : "text-pink-500"
          }`}
        >
          Contact Us 🧁
        </h1>

        <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
          Questions, custom orders, or events — we’re happy to help.
        </p>

        <p className="mt-3 text-sm text-red-500">
          Orders require at least 3 days notice
        </p>
      </motion.div>

      {/* GRID */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.12 } },
        }}
        className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto"
      >
        {contactInfo.map((item, i) => (
          <motion.a
            key={i}
            href={item.link}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener noreferrer" : undefined}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            whileHover={{ scale: 1.03 }}
            className={`rounded-2xl p-5 border shadow-sm transition flex flex-col gap-3 ${
              darkMode
                ? "bg-gray-800 border-pink-700"
                : "bg-white border-pink-100"
            }`}
          >
            {/* ICON */}
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full ${
                darkMode
                  ? "bg-pink-900 text-pink-400"
                  : "bg-pink-50 text-pink-500"
              }`}
            >
              {iconMap[item.type]}
            </div>

            {/* TEXT */}
            <div className="min-w-0">
              <div
                className={`font-semibold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {item.title}
              </div>

              <div className="text-sm break-words text-gray-500">
                {item.value}
              </div>
            </div>
          </motion.a>
        ))}
      </motion.div>

      {/* FOOT NOTE */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="text-center mt-14 max-w-xl mx-auto"
      >
        <p className="text-sm text-gray-500 leading-relaxed">
          Please include your preferred date, cupcake quantity, flavours, and
          any custom design ideas when contacting us.
        </p>
      </motion.div>
    </div>
  );
}