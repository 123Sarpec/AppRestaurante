import React, { useEffect, useMemo, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { PedidoContext } from '../components/PedidoContext';

const toMillis = (v) => (typeof v === 'number' ? v : v?.toMillis?.() ?? null);
const fmt = (s) => {
  const m = Math.floor(s / 60); const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
};

export default function EstadoPedido() {
  const navigation = useNavigation();
  const {
    historialOrdenes = [],
    eliminarOrdenHistorial,
    setEstadoOrdenHistorial,
    upsertOrdenHistorial,
  } = useContext(PedidoContext);

  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);

  // Sincroniza estado en vivo desde Firestore
  useEffect(() => {
    const unsubs = historialOrdenes.map((o) => {
      const ref = doc(db, 'ordenes', o.idOrden);
      return onSnapshot(ref, (snap) => {
        if (!snap.exists()) return;
        const d = snap.data();
        if (d.ordenLista || d.estado === 'lista') setEstadoOrdenHistorial(o.idOrden, 'lista');
        const inicio = toMillis(d.asignadoEn) ?? toMillis(d.creado) ?? null;
        if (inicio && d.tiempoEntrega) {
          upsertOrdenHistorial({
            idOrden: o.idOrden,
            creado: inicio,
            tiempoEntrega: Number(d.tiempoEntrega),
            // si cambió el pedido y el título, lo refrescamos
            titulo: Array.isArray(d.pedido) && d.pedido.length
              ? `${d.pedido[0].nombre}${d.pedido[0].cantidad > 1 ? ` x${d.pedido[0].cantidad}` : ''}${
                d.pedido.length > 1 ? ` + ${d.pedido.slice(1).reduce((a, i) => a + (i.cantidad ?? 1), 0)} más` : ''
              }`
              : o.titulo || 'Pedido',
          });
        }
      });
    });
    return () => unsubs.forEach((u) => u && u());
  }, [historialOrdenes.map((x) => x.idOrden).join(','), setEstadoOrdenHistorial, upsertOrdenHistorial]);

  const items = useMemo(() => {
    return historialOrdenes.map((o) => {
      const inicio = toMillis(o.creado);
      const fin = inicio && o.tiempoEntrega ? inicio + o.tiempoEntrega * 60000 : null;
      const left = fin ? Math.max(0, Math.floor((fin - now) / 1000)) : null;
      const estado = o.estado === 'lista' || left === 0 ? 'lista' : 'en progreso';
      return { ...o, restante: left, estadoCalc: estado };
    });
  }, [historialOrdenes, now]);

  if (!items.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.titulo}>Sin órdenes en historial</Text>
        <Text style={styles.texto}>Cuando tomes pedidos, aparecerán aquí.</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#111827' }]} onPress={() => navigation.navigate('Menu')}>
          <Text style={[styles.btnText, { color: '#fff' }]}>Ir al Menú</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 16 }}>
      <Text style={[styles.titulo, { marginBottom: 12 }]}>Estado de las Ordenes</Text>

      {items.map((o) => (
        <View key={o.idOrden} style={styles.card}>
          <Text style={styles.nombre}>{o.titulo || 'Pedido'}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={{ color: '#6b7280' }}>ID: {o.idOrden}</Text>
            <Text style={{ fontWeight: '700', color: o.estadoCalc === 'lista' ? '#059669' : '#b45309' }}>
              {o.estadoCalc === 'lista' ? 'LISTA' : 'EN PROGRESO'}
            </Text>
          </View>

          {o.estadoCalc !== 'lista' && o.restante != null && (
            <Text style={styles.timer}>{fmt(o.restante)}</Text>
          )}

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('FormularioPlatillo', { idOrden: o.idOrden })}
              style={[styles.btn, { backgroundColor: '#f59e0b' }]}
            >
              <Text style={[styles.btnText, { color: '#111827' }]}>Ver</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => eliminarOrdenHistorial(o.idOrden)}
              style={[styles.btn, { backgroundColor: '#111827' }]}
            >
              <Text style={[styles.btnText, { color: '#fff' }]}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#111827', textAlign: 'center' },
  texto: { marginTop: 6, fontSize: 16, color: '#475569', textAlign: 'center' },
  card: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, marginBottom: 12, backgroundColor: '#fafafa' },
  nombre: { fontSize: 16, fontWeight: '700', color: '#111827' },
  timer: { fontSize: 32, fontWeight: '800', color: '#f59e0b', textAlign: 'center', marginTop: 8 },
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  btnText: { fontWeight: '700', fontSize: 14 },
});
