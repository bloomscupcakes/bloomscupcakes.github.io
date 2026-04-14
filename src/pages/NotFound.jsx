import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import notFoundImg from "../assets/404.png"; // adjust path if needed

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center text-center py-24"
    >
      <img
        src={notFoundImg}
        alt="404 Not Found"
        className="w-72 md:w-96 mb-6 opacity-90"
      />

      <h2 className="text-2xl font-semibold mt-4">
        Oops! This cupcake doesn’t exist 🧁
      </h2>

      <p className="text-gray-600 mt-2 max-w-md">
        The page you’re looking for might have been moved or never baked.
      </p>

      <Link
        to="/"
        className="mt-6 bg-pink-500 text-white px-6 py-3 rounded-xl shadow hover:bg-pink-600 transition"
      >
        Go Home
      </Link>
    </motion.div>
  );
}