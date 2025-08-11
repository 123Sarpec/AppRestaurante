// components/PedidoContext.js
import React, {
  createContext,
  useState,
  useCallback,
  useContext,
} from 'react';

export const PedidoContext = createContext({
  // Carrito
  pedido: [],
  agregarAlPedido: () => {},
  eliminarDelPedido: () => {},
  limpiarPedido: () => {},

  // Orden en curso (para el botón/estado en header)
  ordenEnCurso: null, // { idOrden, creado(ms o Timestamp), tiempoEntrega(min), estado? }
  setOrdenActual: () => {},
  limpiarOrdenActual: () => {},

  // Historial de órdenes (múltiples)
  historialOrdenes: [], // [{ idOrden, creado, tiempoEntrega, estado: 'en progreso'|'lista' }]
  upsertOrdenHistorial: () => {},
  setEstadoOrdenHistorial: () => {},
  eliminarOrdenHistorial: () => {},
  limpiarHistorial: () => {},
});

export const PedidoProvider = ({ children }) => {
  // ----------------- Carrito -----------------
  const [pedido, setPedido] = useState([]);

  const agregarAlPedido = useCallback((nuevo) => {
    setPedido((prev) => {
      const ex = prev.find((p) => p.id === nuevo.id);
      if (ex) {
        return prev.map((p) =>
          p.id === nuevo.id ? { ...p, cantidad: p.cantidad + nuevo.cantidad } : p
        );
      }
      return [...prev, nuevo];
    });
  }, []);

  const eliminarDelPedido = useCallback((id) => {
    setPedido((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const limpiarPedido = useCallback(() => setPedido([]), []);

  // ------------- Orden en curso + Historial -------------
  const [ordenEnCurso, setOrdenEnCurso] = useState(null);
  const [historialOrdenes, setHistorialOrdenes] = useState([]);

  // Crea/actualiza una orden en el historial (por idOrden)
  const upsertOrdenHistorial = useCallback((orden) => {
    if (!orden?.idOrden) return;
    setHistorialOrdenes((prev) => {
      const idx = prev.findIndex((o) => o.idOrden === orden.idOrden);
      if (idx >= 0) {
        const merged = { ...prev[idx], ...orden };
        const next = [...prev];
        next[idx] = merged;
        return next;
      }
      // nuevas al inicio
      return [{ ...orden }, ...prev];
    });
  }, []);

  // Solo cambia el estado ('en progreso' | 'lista') de una orden del historial
  const setEstadoOrdenHistorial = useCallback((idOrden, estado) => {
    setHistorialOrdenes((prev) =>
      prev.map((o) => (o.idOrden === idOrden ? { ...o, estado } : o))
    );
    // si la orden en curso coincide, refleja el estado
    setOrdenEnCurso((cur) =>
      cur?.idOrden === idOrden ? { ...cur, estado } : cur
    );
  }, []);

  // Eliminar una orden del historial
  const eliminarOrdenHistorial = useCallback((idOrden) => {
    setHistorialOrdenes((prev) => prev.filter((o) => o.idOrden !== idOrden));
    setOrdenEnCurso((cur) => (cur?.idOrden === idOrden ? null : cur));
  }, []);

  const limpiarHistorial = useCallback(() => {
    setHistorialOrdenes([]);
    setOrdenEnCurso(null);
  }, []);

  // Establece la orden en curso (y la guarda/actualiza en historial)
  const setOrdenActual = useCallback((orden) => {
    if (!orden?.idOrden) return;
    const payload = {
      idOrden: orden.idOrden,
      creado: orden.creado,
      tiempoEntrega: Number(orden.tiempoEntrega) || null,
      estado: orden.estado || 'en progreso',
    };
    setOrdenEnCurso(payload);
    upsertOrdenHistorial(payload);
  }, [upsertOrdenHistorial]);

  const limpiarOrdenActual = useCallback(() => setOrdenEnCurso(null), []);

  return (
    <PedidoContext.Provider
      value={{
        // carrito
        pedido,
        agregarAlPedido,
        eliminarDelPedido,
        limpiarPedido,
        // estado/orden actual
        ordenEnCurso,
        setOrdenActual,
        limpiarOrdenActual,
        // historial
        historialOrdenes,
        upsertOrdenHistorial,
        setEstadoOrdenHistorial,
        eliminarOrdenHistorial,
        limpiarHistorial,
      }}
    >
      {children}
    </PedidoContext.Provider>
  );
};

// helper para consumirlo más fácil
export const usePedido = () => useContext(PedidoContext);
