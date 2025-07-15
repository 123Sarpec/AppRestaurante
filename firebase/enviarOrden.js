import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase'; // Asegúrate de que esté bien importado

export async function enviarOrdenAFirebase(pedido, total) {
  try {
    const nuevaOrden = {
      pedido,
      total,
      estado: 'esperando', // Estado inicial
      fecha: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'ordenes'), nuevaOrden);
    return docRef.id; // Devuelve el ID de la orden
  } catch (error) {
    console.error(' Error al enviar la orden:', error);
    return null;
  }
}
