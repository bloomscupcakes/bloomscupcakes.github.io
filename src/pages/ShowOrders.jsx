import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import app, { db } from "../firebase";
import { collection, getDocs, query, orderBy, startAfter, limit, updateDoc, doc } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import Loader from "../components/Loader";

const PAGE_SIZE = 8;

export default function ShowOrders({ darkMode }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const auth = getAuth(app);
  const statusOptions = ["new", "completed", "delivered", "refunded"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        setOrders([]);
        setIsAuthorized(true);
      }
    });
    return unsubscribe;
  }, [auth]);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async (cursor = null) => {
    setLoading(true);
    try {
      const q = cursor 
        ? query(collection(db, "orders"), orderBy("createdAt", "desc"), startAfter(cursor), limit(PAGE_SIZE))
        : query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(PAGE_SIZE));

      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      setOrders(prev => cursor ? [...prev, ...data] : data);
      setLastDoc(snap.docs[snap.docs.length - 1]);
      setHasMore(snap.docs.length === PAGE_SIZE);
      setIsAuthorized(true);
    } catch (err) {
      if (err.code === "permission-denied") setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateDoc(doc(db, "orders", id), { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  if (authLoading) return <div className="flex min-h-screen items-center justify-center"><Loader type="cupcake" /></div>;

  if (user && !isAuthorized) {
    return (
      <div className={`flex min-h-screen items-center justify-center p-6 ${darkMode ? "bg-gray-950 text-white" : "bg-white"}`}>
        <div className="text-center">
          <h1 className="text-2xl font-black uppercase text-red-500 italic">Unauthorized</h1>
          <p className="text-sm opacity-60 mt-2">You do not have permission to view this data.</p>
          <button onClick={() => signOut(auth)} className="mt-6 text-xs font-bold underline">Sign Out</button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${darkMode ? "bg-gray-950" : "bg-[#FFFCFD]"}`}>
        <button 
          onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}
          className="bg-pink-500 text-white px-10 py-4 rounded-2xl font-black uppercase shadow-xl hover:bg-pink-600 transition-all"
        >
          Admin Login
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 md:p-10 ${darkMode ? "bg-gray-950 text-white" : "bg-[#F9F9F9] text-gray-900"}`}>
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black italic uppercase text-pink-500 leading-none">Order Manager</h1>
            <p className="text-[10px] font-black opacity-30 mt-2 tracking-widest uppercase">Admin: {user.email}</p>
          </div>
          <button onClick={() => signOut(auth)} className="text-[10px] font-black uppercase opacity-40 hover:text-red-500 transition-colors">Sign Out</button>
        </header>

        <div className="grid gap-8">
          {orders.map(order => (
            <motion.div 
              layout
              key={order.id} 
              className={`rounded-[2.5rem] border-2 overflow-hidden shadow-sm ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-pink-50"}`}
            >
              {/* Top Banner: Status and ID */}
              <div className={`px-8 py-3 flex justify-between items-center ${darkMode ? "bg-gray-800/50" : "bg-pink-50/30"}`}>
                <span className="text-[10px] font-black opacity-40 uppercase tracking-tighter">Order Ref: {order.id}</span>
                <select 
                  value={order.status || "new"} 
                  onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                  className={`text-[10px] uppercase rounded-lg px-3 py-1 border-2 outline-none cursor-pointer transition-all ${
                    order.status === 'completed' ? 'bg-green-500 text-white border-green-500' : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="p-8 grid md:grid-cols-3 gap-10">
                
                {/* Column 1: Customer & Fulfillment */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[10px] font-black uppercase text-pink-500 mb-2 tracking-widest">Customer</h3>
                    <p className="text-xl font-black uppercase leading-tight">{order.customer?.name}</p>
                    <p className="text-sm font-bold opacity-60 mt-1">{order.customer?.email}</p>
                    <p className="text-sm font-bold opacity-60">{order.customer?.phone}</p>
                    <p className="text-[10px] font-black mt-2 opacity-40 uppercase tracking-tighter">Prefers: {order.customer?.contactPreference}</p>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-black uppercase text-pink-500 mb-2 tracking-widest">Fulfillment</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${order.fulfillment?.method === 'delivery' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'}`}>
                        {order.fulfillment?.method}
                      </span>
                      <p className="text-sm font-black text-pink-600 italic">{order.order?.pickupDate}</p>
                    </div>
                    {order.fulfillment?.method === 'delivery' && (
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.fulfillment.address)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-blue-500 hover:underline block"
                      >
                        📍 {order.fulfillment.address}
                      </a>
                    )}
                  </div>
                </div>

                {/* Column 2: Items & Financials */}
                <div className="md:border-x border-dotted border-gray-200 dark:border-gray-700 md:px-8">
                  <h3 className="text-[10px] font-black uppercase text-pink-500 mb-4 tracking-widest">Order Details</h3>
                  <div className="space-y-4">
                    {order.order?.items?.map((item, i) => (
                      <div key={i} className="flex justify-between items-start text-sm">
                        <div className="pr-4">
                          <p className="font-black leading-none">{item.quantity}x {item.productTitle}</p>
                          <p className="text-[10px] font-bold opacity-40 uppercase mt-1">{item.packSize} • {item.flavour}</p>
                        </div>
                        <p className="font-black text-pink-500">${(item.quantity * item.priceAtPurchase).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-1">
                    <div className="flex justify-between text-[10px] font-bold opacity-50 uppercase">
                      <span>Subtotal</span>
                      <span>${order.order?.subtotal}</span>
                    </div>
                    {parseFloat(order.order?.surcharge) > 0 && (
                      <div className="flex justify-between text-[10px] font-bold text-pink-400 uppercase">
                        <span>Multi-Flavour Surcharge</span>
                        <span>+${order.order?.surcharge}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[10px] font-bold opacity-50 uppercase">
                      <span>Tax (13%)</span>
                      <span>${order.order?.tax}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs font-black uppercase tracking-tighter">Total</span>
                      <span className="text-2xl font-black text-pink-600">${order.order?.total}</span>
                    </div>
                  </div>
                </div>

                {/* Column 3: Design & Notes */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[10px] font-black uppercase text-pink-500 mb-2 tracking-widest">Theme / Inspiration</h3>
                    <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-700 italic text-xs leading-relaxed">
                      {order.order?.themeDescription ? `"${order.order.themeDescription}"` : "No specific theme provided."}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-black uppercase text-pink-500 mb-2 tracking-widest">Special Notes</h3>
                    <p className="text-xs opacity-60 leading-relaxed font-medium">
                      {order.order?.notes || "No additional notes."}
                    </p>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <p className="text-[9px] font-black opacity-20 uppercase">
                      Created: {order.createdAt?.toDate().toLocaleString()}
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

        {hasMore && (
          <button 
            onClick={() => fetchOrders(lastDoc)}
            className="mt-12 w-full py-6 border-2 border-dashed border-pink-100 dark:border-gray-800 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 hover:border-pink-500 transition-all"
          >
            Load More Requests
          </button>
        )}
      </div>
    </div>
  );
}