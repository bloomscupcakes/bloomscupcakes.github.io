import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import app, { db } from "../firebase";
import { collection, getDocs, query, orderBy, startAfter, endBefore, limit, updateDoc, doc } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithRedirect, signOut } from "firebase/auth";
import Loader from "../components/Loader";

const PAGE_SIZE = 5;

export default function ShowOrders({ darkMode }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCache, setPageCache] = useState([]);
  const [pageCursors, setPageCursors] = useState([]);
  const [pageHasMoreOlder, setPageHasMoreOlder] = useState([]);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);

  const statusOptions = ["new", "completed", "delivered", "refunded"];
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false);
      },
      (error) => {
        console.error("Auth state error:", error);
        setErrorMessage("Authentication error. Refresh and try again.");
        setAuthLoading(false);
      }
    );

    return unsubscribe;
  }, [auth]);

  useEffect(() => {
    if (user) {
      resetPaginationAndFetch();
    } else {
      setOrders([]);
      setPageIndex(0);
      setPageCache([]);
      setPageCursors([]);
      setPageHasMoreOlder([]);
      setHasMoreOlder(false);
      setLoading(false);
    }
  }, [user]);

  const resetPaginationAndFetch = () => {
    setPageIndex(0);
    setPageCache([]);
    setPageCursors([]);
    setPageHasMoreOlder([]);
    fetchOrdersPage();
  };

  const signInWithGoogle = async () => {
    setErrorMessage("");
    setAuthLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Google sign-in failed:", error);
      setErrorMessage("Google sign-in failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setOrders([]);
      setErrorMessage("");
      setPageIndex(0);
      setPageCache([]);
      setPageCursors([]);
      setPageHasMoreOlder([]);
      setHasMoreOlder(false);
    } catch (error) {
      console.error("Sign-out failed:", error);
      setErrorMessage("Could not sign out. Please try again.");
    }
  };

  const fetchOrdersPage = async (cursor = null, direction = "older") => {
    setErrorMessage("");
    setLoading(true);

    try {
      let q;

      if (!cursor) {
        q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(PAGE_SIZE));
      } else if (direction === "older") {
        q = query(collection(db, "orders"), orderBy("createdAt", "desc"), startAfter(cursor), limit(PAGE_SIZE));
      } else {
        q = query(collection(db, "orders"), orderBy("createdAt", "desc"), endBefore(cursor), limit(PAGE_SIZE));
      }

      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }));

      const firstDoc = querySnapshot.docs[0] || null;
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
      const moreOlder = querySnapshot.docs.length === PAGE_SIZE;

      if (!cursor) {
        setPageCache([ordersData]);
        setPageCursors([{ firstDoc, lastDoc }]);
        setPageHasMoreOlder([moreOlder]);
        setPageIndex(0);
      } else if (direction === "older") {
        setPageCache((prevCache) => [...prevCache, ordersData]);
        setPageCursors((prevCursors) => [...prevCursors, { firstDoc, lastDoc }]);
        setPageHasMoreOlder((prevHasMore) => [...prevHasMore, moreOlder]);
        setPageIndex((prevPageIndex) => prevPageIndex + 1);
      }

      setOrders(ordersData);
      setHasMoreOlder(moreOlder);
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.code === "permission-denied") {
        setErrorMessage("You are not authorized to view orders. Please sign in with an approved account.");
      } else {
        setErrorMessage("Failed to load orders. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadOlderOrders = async () => {
    if (!pageCursors[pageIndex]?.lastDoc) {
      return;
    }

    const nextPageIndex = pageIndex + 1;

    if (pageCache[nextPageIndex]) {
      setPageIndex(nextPageIndex);
      setOrders(pageCache[nextPageIndex]);
      setHasMoreOlder(pageHasMoreOlder[nextPageIndex]);
      return;
    }

    await fetchOrdersPage(pageCursors[pageIndex].lastDoc, "older");
  };

  const loadNewerOrders = async () => {
    if (pageIndex === 0) {
      return;
    }

    const previousPageIndex = pageIndex - 1;
    const previousOrders = pageCache[previousPageIndex];

    if (previousOrders) {
      setPageIndex(previousPageIndex);
      setOrders(previousOrders);
      setHasMoreOlder(pageHasMoreOlder[previousPageIndex]);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  if (authLoading || (user && loading)) {
    return (
      <div className={`flex min-h-[50vh] items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-[#FFFCFD] text-gray-800"}`}>
        <Loader type="cupcake" size="xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`px-4 py-10 flex min-h-[50vh] items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-[#FFFCFD] text-gray-800"}`}>
        <div className={`w-full max-w-xl rounded-3xl border-2 p-10 ${darkMode ? "border-gray-700 bg-gray-900" : "border-pink-100 bg-white"}`}>
          <h1 className={`text-4xl font-bold mb-6 ${darkMode ? "text-pink-400" : "text-pink-600"}`}>
            Orders Admin Login
          </h1>
          <p className="mb-6 text-sm opacity-80">
            Sign in with Google to access orders. Your Firebase security rules will verify whether your account is allowed.
          </p>
          {errorMessage && (
            <div className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800">
              {errorMessage}
            </div>
          )}
          <button
            onClick={signInWithGoogle}
            className="rounded-full bg-pink-500 px-6 py-3 text-white font-bold shadow-lg transition hover:bg-pink-600"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`px-4 py-10 ${darkMode ? "bg-gray-900 text-white" : "bg-[#FFFCFD] text-gray-800"}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-4xl font-bold ${darkMode ? "text-pink-400" : "text-pink-600"}`}>
              Orders Management
            </h1>
            <p className="text-sm opacity-70">
              Signed in as <span className="font-semibold">{user.email}</span>
            </p>
          </div>
          <button
            onClick={signOutUser}
            className="rounded-full bg-gray-200 px-5 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-300"
          >
            Sign out
          </button>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-800">
            {errorMessage}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm opacity-80">
            Showing top {PAGE_SIZE} orders. Page {pageIndex + 1}.
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadNewerOrders}
              disabled={pageIndex === 0}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${pageIndex === 0 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white text-gray-900 hover:bg-gray-100"}`}
            >
              Newer
            </button>
            <button
              onClick={loadOlderOrders}
              disabled={!hasMoreOlder}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${!hasMoreOlder ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-pink-500 text-white hover:bg-pink-600"}`}
            >
              Older
            </button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className={`p-16 border-2 border-dashed rounded-3xl text-center opacity-40 italic ${darkMode ? "border-gray-700" : "border-pink-200"}`}>
            No orders found.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-2xl shadow-lg border-2 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-pink-100"}`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-pink-500">{order.customer.name}</h2>
                    <p className="text-sm opacity-70">{order.customer.email} | {order.customer.phone}</p>
                    <p className="text-sm opacity-70">Pickup: {order.order.pickupDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-pink-600">${order.order.total}</p>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`mt-3 px-3 py-1 rounded-full text-sm font-bold border-2 ${
                        order.status === "new" ? "bg-yellow-100 text-yellow-800 border-yellow-300" :
                        order.status === "completed" ? "bg-green-100 text-green-800 border-green-300" :
                        order.status === "delivered" ? "bg-blue-100 text-blue-800 border-blue-300" :
                        "bg-red-100 text-red-800 border-red-300"
                      }`}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-bold mb-2">Items:</h3>
                  <ul className="space-y-1">
                    {order.order.items.map((item, index) => (
                      <li key={index} className="text-sm">
                        {item.quantity}x {item.productTitle} ({item.packSize}, {item.flavour}) - ${item.pricePerUnit} each
                      </li>
                    ))}
                  </ul>
                </div>

                {order.order.notes && (
                  <div className="mb-4">
                    <h3 className="font-bold mb-2">Notes:</h3>
                    <p className="text-sm italic">{order.order.notes}</p>
                  </div>
                )}

                <div className="text-xs opacity-50">
                  Order ID: {order.id} | Created: {order.createdAt?.toDate?.()?.toLocaleString() || "N/A"}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}