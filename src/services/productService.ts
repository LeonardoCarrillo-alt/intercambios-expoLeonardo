import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, setDoc, orderBy } from "firebase/firestore";
import { db } from "../../app/config/firebase";

export const createProduct = async (payload: any, ownerId: string) => {
  const colRef = collection(db, "products");
  const data = { ...payload, ownerId, status: "pending", createdAt: serverTimestamp() };
  const ref = await addDoc(colRef, data);
  return ref.id;
};

export const fetchPendingProducts = async () => {
  const colRef = collection(db, "products");
  const q = query(colRef, where("status", "==", "pending"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const fetchApprovedProducts = async () => {
  const colRef = collection(db, "products");
  const q = query(colRef, where("status", "==", "approved"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const fetchProductsByOwner = async (uid: string) => {
  const colRef = collection(db, "products");
  const q = query(colRef, where("ownerId", "==", uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const approveProduct = async (productId: string, adminId: string) => {
  const productRef = doc(db, "products", productId);
  await updateDoc(productRef, { status: "approved", approvedBy: adminId, approvedAt: serverTimestamp() });
  const logRef = doc(collection(productRef, "moderationLogs"));
  await setDoc(logRef, { action: "approved", adminId, timestamp: serverTimestamp() });
};

export const rejectProduct = async (productId: string, adminId: string, reason?: string) => {
  const productRef = doc(db, "products", productId);
  await updateDoc(productRef, { status: "rejected", rejectedBy: adminId, rejectedAt: serverTimestamp(), rejectedReason: reason || null });
  const logRef = doc(collection(productRef, "moderationLogs"));
  await setDoc(logRef, { action: "rejected", reason: reason || null, adminId, timestamp: serverTimestamp() });
};
// NUEVO: Actualizar status del producto
export const updateProductStatus = async (productId: string, status: 'available' | 'reserved' | 'sold') => {
  const productRef = doc(db, 'products', productId);
  await updateDoc(productRef, { 
    status,
    updatedAt: serverTimestamp()
  });
};

// NUEVO: Obtener información del vendedor desde el producto
export const getProductSeller = async (productId: string) => {
  // Esta función necesitaría obtener el ownerId del producto
  // y luego buscar su perfil en la colección 'users'
  // Por ahora retornamos un objeto temporal
  return {
    userId: 'seller_user_id', // Reemplazar con lógica real
    username: 'seller_username',
    email: 'seller@example.com'
  };
};
