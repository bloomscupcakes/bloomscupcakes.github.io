import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import app, { db } from "../firebase";
import { collection, getDocs, query, orderBy, startAfter, limit, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import Loader from "../components/Loader";
import OrderEditModal from "../components/OrderEditModal";
import { PRODUCTS } from "../utils/config";

const PAGE_SIZE = 8;

export default function AdminPage({ darkMode }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  const auth = app ? getAuth(app) : null;
  const statusOptions = ["new", "completed", "delivered", "refunded"];

  useEffect(() => {
    if (!auth) {
      setUser(null);
      setAuthLoading(false);
      setOrders([]);
      setIsAuthorized(true);
      setLoading(false);
      return undefined;
    }

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
    if (user && db) fetchOrders();
  }, [user]);

  const fetchOrders = async (cursor = null) => {
    if (!db) {
      setLoading(false);
      return;
    }

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

  const cloneOrderForEdit = (order) => ({
    ...order,
    createdAt: order.createdAt?.toDate ? order.createdAt.toDate().toISOString().slice(0, 16) : (typeof order.createdAt === "string" ? order.createdAt.slice(0, 16) : ""),
    customer: { ...order.customer },
    fulfillment: { ...order.fulfillment },
    order: {
      ...order.order,
      items: order.order?.items?.map(item => prepareItemForEdit(item)) || []
    }
  });

  const openEditModal = (order) => {
    setEditOrder(cloneOrderForEdit(order));
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditOrder(null);
  };

  const closeDeletePopup = () => setDeleteTarget(null);

  const updateCustomerField = (field, value) => {
    setEditOrder(prev => ({ ...prev, customer: { ...prev.customer, [field]: value } }));
  };

  const updateFulfillmentField = (field, value) => {
    setEditOrder(prev => ({ ...prev, fulfillment: { ...prev.fulfillment, [field]: value } }));
  };

  const updateOrderField = (field, value) => {
    setEditOrder(prev => ({ ...prev, order: { ...prev.order, [field]: value } }));
  };

  const updateRootField = (field, value) => {
    setEditOrder(prev => ({ ...prev, [field]: value }));
  };

  const getProductById = (id) => PRODUCTS.find(product => product.id === id) || PRODUCTS[0];
  const getProductByTitle = (title) => PRODUCTS.find(product => product.title === title || product.id === title) || PRODUCTS[0];

  const getFlavourExtra = (productId, flavour) => {
    const product = getProductById(productId);
    return product.flavours?.find(option => option.label === flavour)?.extra ?? 0;
  };

  const getFillingExtra = (productId, filling) => {
    const product = getProductById(productId);
    return product.fillings?.find(option => option.label === filling)?.extra ?? 0;
  };

  const getDiameterExtra = (productId, diameter) => {
    const product = getProductById(productId);
    return product.diameters?.find(option => String(option.label) === String(diameter))?.extra ?? 0;
  };

  const getPackPrice = (productId, packSize) => {
    const product = getProductById(productId);
    return product.packSizes.find(pack => pack.name === packSize)?.price ?? product.packSizes?.[0]?.price ?? 0;
  };

  const getTierCount = (packName) => {
    if (/3\s*tier/i.test(packName)) return 3;
    if (/2\s*tier/i.test(packName)) return 2;
    if (/single/i.test(packName)) return 1;
    return 1;
  };

  const normalizeDiameters = (diameters) =>
    Array.isArray(diameters)
      ? diameters.map(String)
      : diameters === undefined || diameters === null
        ? []
        : [String(diameters)];

  const calculateAdminItemPrice = ({ productId, packSize, flavour, filling, diameters }) => {
    const base = getPackPrice(productId, packSize);
    const flavourExtra = getFlavourExtra(productId, flavour);
    const fillingExtra = getFillingExtra(productId, filling);
    const diameterExtra = normalizeDiameters(diameters).reduce((sum, diameter) => sum + getDiameterExtra(productId, diameter), 0);
    return Number(base + flavourExtra + fillingExtra + diameterExtra);
  };

  const prepareItemForEdit = (item) => {
    const product = item.productId ? getProductById(item.productId) : getProductByTitle(item.productTitle || "");
    const productId = product.id;
    const packSize = item.packSize || product.packSizes?.[0]?.name || "";
    const flavour = item.flavour || product.flavours?.[0]?.label || "";
    const filling = item.filling || product.fillings?.[0]?.label || "";
    const diameters = normalizeDiameters(item.diameters || item.selectedDiameters);
    const quantity = Number(item.quantity) || 1;
    const pricePerUnit = Number(item.pricePerUnit) || calculateAdminItemPrice({ productId, packSize, flavour, filling, diameters });

    return {
      ...item,
      productId,
      productTitle: product.title,
      packSize,
      flavour,
      filling,
      diameters,
      quantity,
      pricePerUnit
    };
  };

  const updateOrderItemField = (index, field, value) => {
    setEditOrder(prev => {
      const items = prev.order.items.map((item, i) => {
        if (i !== index) return item;
        let nextItem = { ...item, [field]: value };

        if (field === "productId") {
          const product = getProductById(value);
          const defaultPack = product.packSizes?.[0]?.name || "";
          const defaultFlavour = product.flavours?.[0]?.label || "";
          const defaultFilling = product.fillings?.[0]?.label || "";
          const defaultDiameters = product.diameters
            ? Array.from({ length: getTierCount(defaultPack) }, () => product.diameters[0]?.label || "")
            : [];

          nextItem = {
            ...nextItem,
            productTitle: product.title,
            packSize: defaultPack,
            flavour: defaultFlavour,
            filling: defaultFilling,
            diameters: defaultDiameters,
          };
        }

        if (field === "packSize") {
          const product = getProductById(item.productId);
          const tierCount = getTierCount(value);
          const existingDiameters = normalizeDiameters(item.diameters).slice(0, tierCount);
          nextItem.diameters = product.diameters
            ? Array.from(
                { length: tierCount },
                (_, idx) => existingDiameters[idx] ?? (product.diameters[0]?.label || "")
              )
            : [];
        }

        if (field === "flavour" || field === "filling" || field === "diameters" || field === "packSize" || field === "productId") {
          nextItem.pricePerUnit = calculateAdminItemPrice({
            productId: nextItem.productId,
            packSize: nextItem.packSize,
            flavour: nextItem.flavour,
            filling: nextItem.filling,
            diameters: nextItem.diameters,
          });
        }

        return nextItem;
      });
      return { ...prev, order: { ...prev.order, items } };
    });
  };

  const addItem = () => {
    setEditOrder(prev => {
      const firstProduct = PRODUCTS[0];
      const firstPack = firstProduct.packSizes?.[0]?.name || "";
      const firstFlavour = firstProduct.flavours?.[0]?.label ||"";
      const firstFilling = firstProduct.fillings?.[0]?.label || "";
      const firstDiameters = firstProduct.diameters
        ? Array.from({ length: getTierCount(firstPack) }, () => firstProduct.diameters[0]?.label || "")
        : [];
      const newItem = {
        productId: firstProduct.id,
        productTitle: firstProduct.title,
        packSize: firstPack,
        flavour: firstFlavour,
        filling: firstFilling,
        diameters: firstDiameters,
        quantity: 1,
        pricePerUnit: calculateAdminItemPrice({
          productId: firstProduct.id,
          packSize: firstPack,
          flavour: firstFlavour,
          filling: firstFilling,
          diameters: firstDiameters,
        }),
      };
      return { ...prev, order: { ...prev.order, items: [...(prev.order.items || []), newItem] } };
    });
  };

  const removeItem = (index) => {
    setEditOrder(prev => {
      const items = prev.order.items.filter((_, i) => i !== index);
      return { ...prev, order: { ...prev.order, items } };
    });
  };

  const normalizeAmount = (value) => {
    const parsed = parseFloat(String(value).replace(/[^0-9.\-]/g, ""));
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const recalcOrderTotals = (rawOrder) => {
    const items = rawOrder.order?.items || [];
    const itemSubtotal = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.pricePerUnit) || 0), 0);
    const subtotal = normalizeAmount(rawOrder.order?.subtotal) || itemSubtotal;
    const surcharge = normalizeAmount(rawOrder.order?.surcharge);
    const deliveryFee = normalizeAmount(rawOrder.fulfillment?.deliveryFee);
    const tax = normalizeAmount(rawOrder.order?.tax) || Number(((subtotal + surcharge + deliveryFee) * 0.13).toFixed(2));
    const total = normalizeAmount(rawOrder.order?.total) || Number((subtotal + surcharge + deliveryFee + tax).toFixed(2));

    return {
      ...rawOrder,
      order: {
        ...rawOrder.order,
        subtotal: subtotal.toFixed(2),
        surcharge: surcharge.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2)
      },
      fulfillment: {
        ...rawOrder.fulfillment,
        deliveryFee: deliveryFee.toFixed(2)
      }
    };
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();
    if (!editOrder) return;

    setIsBusy(true);
    const finalOrder = recalcOrderTotals(editOrder);
    const payload = {
      customer: finalOrder.customer,
      fulfillment: finalOrder.fulfillment,
      order: finalOrder.order,
      status: finalOrder.status || "new"
    };

    if (finalOrder.createdAt) {
      const parsedDate = new Date(finalOrder.createdAt);
      if (!Number.isNaN(parsedDate.getTime())) {
        payload.createdAt = Timestamp.fromDate(parsedDate);
      }
    }

    try {
      await updateDoc(doc(db, "orders", finalOrder.id), payload);
      setOrders(prev => prev.map(o => o.id === finalOrder.id ? { ...o, ...payload } : o));
      closeEditModal();
    } catch (err) {
      console.error(err);
      alert("Failed to save order changes.");
    } finally {
      setIsBusy(false);
    }
  };

  const confirmDeleteOrder = async () => {
    if (!deleteTarget) return;
    setIsBusy(true);
    try {
      await deleteDoc(doc(db, "orders", deleteTarget));
      setOrders(prev => prev.filter(o => o.id !== deleteTarget));
      closeDeletePopup();
    } catch (err) {
      console.error(err);
      alert("Failed to delete order.");
    } finally {
      setIsBusy(false);
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
              <div className={`px-8 py-3 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center ${darkMode ? "bg-gray-800/50" : "bg-pink-50/30"}`}>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-black opacity-40 uppercase tracking-tighter">Order Ref: {order.id}</span>
                  <button
                    type="button"
                    onClick={() => openEditModal(order)}
                    className="text-[10px] uppercase rounded-full border border-pink-200 px-3 py-1 font-black tracking-widest transition hover:bg-pink-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(order.id)}
                    className="text-[10px] uppercase rounded-full border border-red-200 px-3 py-1 font-black tracking-widest text-red-600 transition hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
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
                          <p className="text-[10px] font-bold opacity-40 uppercase mt-1">
                            {item.packSize} • {item.flavour}
                            {item.filling ? ` • ${item.filling}` : ""}
                            {Array.isArray(item.diameters) && item.diameters.length > 0 ? ` • ${item.diameters.map((diam) => `${diam}"`).join(" / ")}` : ""}
                          </p>
                        </div>
                        <p className="font-black text-pink-500">${(Number(item.quantity) || 0) * (Number(item.pricePerUnit) || 0)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-1">
                    <div className="flex justify-between text-[10px] font-bold opacity-50 uppercase">
                      <span>Subtotal</span>
                      <span>${order.order?.subtotal}</span>
                    </div>
                    {parseFloat(order.order?.surcharge) > 0 && (
                      <div className="flex justify-between text-[10px] font-bold opacity-50 uppercase">
                        <span>Multi-Flavour Surcharge</span>
                        <span>${order.order?.surcharge}</span>
                      </div>
                    )}
                    {parseFloat(order.fulfillment?.deliveryFee) > 0 && (
                      <div className="flex justify-between text-[10px] font-bold opacity-50 uppercase">
                        <span>Delivery Fee</span>
                        <span>${order.fulfillment?.deliveryFee}</span>
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

      <AnimatePresence>
        {isEditOpen && editOrder && (
          <OrderEditModal
            order={editOrder}
            onClose={closeEditModal}
            onSave={handleSaveEdit}
            isBusy={isBusy}
            statusOptions={statusOptions}
            products={PRODUCTS}
            flavours={PRODUCTS.flatMap(p => p.flavours || [])}
            updateCustomerField={updateCustomerField}
            updateFulfillmentField={updateFulfillmentField}
            updateOrderField={updateOrderField}
            updateRootField={updateRootField}
            updateOrderItemField={updateOrderItemField}
            addItem={addItem}
            removeItem={removeItem}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl dark:bg-gray-950 dark:text-white"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              <h2 className="text-2xl font-black uppercase tracking-tight">Delete this order?</h2>
              <p className="mt-4 text-sm opacity-70">
                This cannot be undone. Confirm deletion for order {orders.find(o => o.id === deleteTarget)?.id || deleteTarget}.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeDeletePopup}
                  className="rounded-2xl border border-gray-300 px-6 py-3 text-sm uppercase font-black transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteOrder}
                  disabled={isBusy}
                  className="rounded-2xl bg-red-500 px-6 py-3 text-sm uppercase font-black text-white transition hover:bg-red-600 disabled:opacity-40"
                >
                  {isBusy ? "Deleting…" : "Delete Order"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}