import React, { createContext, useState } from 'react';

export const PedidoContext = createContext();

export const PedidoProvider = ({ children }) => {
  const [pedido, setPedido] = useState([]);

  const agregarAlPedido = (nuevoPlatillo) => {
    setPedido((prevPedido) => {
      const existente = prevPedido.find((p) => p.id === nuevoPlatillo.id);
      if (existente) {
        return prevPedido.map((p) =>
          p.id === nuevoPlatillo.id
            ? { ...p, cantidad: p.cantidad + nuevoPlatillo.cantidad }
            : p
        );
      }
      return [...prevPedido, nuevoPlatillo];
    });
  };

  const eliminarDelPedido = (id) => {
    setPedido((prev) => prev.filter((p) => p.id !== id));
  };

  const limpiarPedido = () => {
    setPedido([]);
  };

  return (
    <PedidoContext.Provider value={{ pedido, agregarAlPedido, eliminarDelPedido, limpiarPedido }}>
      {children}
    </PedidoContext.Provider>
  );
};
