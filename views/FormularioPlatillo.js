import React, { useEffect, useRef, useState, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { PedidoContext } from '../components/PedidoContext';

const toMillis = (v) => (typeof v === 'number' ? v : v?.toMillis?.() ?? null);

// Construye un título legible con el/los platillos del pedido
const makeTitulo = (pedido = []) => {
  if (!Array.isArray(pedido) || pedido.length === 0) return 'Pedido';
  const first = pedido[0];
  const firstTxt = `${first.nombre}${first.cantidad > 1 ? ` x${first.cantidad}` : ''}`;
  if (pedido.length === 1) return firstTxt;
  const restantes = pedido
    .slice(1)
    .reduce((acc, i) => acc + (i.cantidad ?? 1), 0);
  return `${firstTxt} + ${restantes} más`;
};

export default function FormularioPlatillo() {
  const [estado, setEstado] = useState('esperando');          // esperando | en progreso | lista
  const [tiempoRestante, setTiempoRestante] = useState(null); // segundos
  const [minutosAsignados, setMinutosAsignados] = useState(null);
  const [creadoMs, setCreadoMs] = useState(null);
  const [titulo, setTitulo] = useState('Pedido');
  const intervalRef = useRef(null);

  const route = useRoute();
  const navigation = useNavigation();
  const { idOrden } = route.params ?? {};

  const {
    setOrdenActual,
    upsertOrdenHistorial,
    setEstadoOrdenHistorial,
  } = useContext(PedidoContext);

  const clearTick = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!idOrden) return;

    const unsub = onSnapshot(doc(db, 'ordenes', idOrden), async (snap) => {
      clearTick();
      if (!snap.exists()) return;

      const data = snap.data();

      // título con nombres de platillos
      setTitulo(makeTitulo(data?.pedido || []));

      // minutos asignados
      if (typeof data?.tiempoEntrega === 'number') setMinutosAsignados(data.tiempoEntrega);
      else if (data?.tiempoEntrega) {
        const val = parseInt(String(data.tiempoEntrega), 10);
        setMinutosAsignados(Number.isFinite(val) ? val : null);
      } else setMinutosAsignados(null);

      // base de tiempo (asignadoEn/creado)
      const inicio = toMillis(data.asignadoEn) ?? toMillis(data.creado) ?? null;
      setCreadoMs(inicio);

      // Guardar/actualizar en contexto (con título)
      if (inicio && data.tiempoEntrega) {
        const payload = {
          idOrden,
          creado: inicio,
          tiempoEntrega: Number(data.tiempoEntrega),
          estado: data.ordenLista || data.estado === 'lista' ? 'lista' : 'en progreso',
          titulo: makeTitulo(data?.pedido || []),
        };
        setOrdenActual(payload);
        upsertOrdenHistorial(payload);
      }

      // ¿ya está lista?
      if (data.ordenLista || data.estado === 'lista') {
        setEstado('lista');
        setTiempoRestante(0);
        setEstadoOrdenHistorial(idOrden, 'lista');
        return;
      }

      // calcular fin del conteo
      const finMs =
        toMillis(data.tiempoEstimadoHasta) ??
        (inicio && data.tiempoEntrega ? inicio + Number(data.tiempoEntrega) * 60000 : null) ??
        (data.tiempoEntrega ? Date.now() + Number(data.tiempoEntrega) * 60000 : null);

      if (finMs && data.tiempoEntrega) {
        setEstado('en progreso');

        const tick = async () => {
          const restante = Math.max(0, Math.floor((finMs - Date.now()) / 1000));
          setTiempoRestante(restante);

          if (restante === 0) {
            clearTick();
            setEstado('lista');
            setEstadoOrdenHistorial(idOrden, 'lista');
            try {
              await updateDoc(doc(db, 'ordenes', idOrden), { ordenLista: true, estado: 'lista' });
            } catch {}
          }
        };

        tick();
        intervalRef.current = setInterval(tick, 1000);
      } else {
        setEstado('esperando');
        setTiempoRestante(null);
      }
    });

    return () => {
      clearTick();
      unsub?.();
    };
  }, [idOrden, setOrdenActual, upsertOrdenHistorial, setEstadoOrdenHistorial]);

  const f = (s) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  };

  const onSeguirOrdenando = () => {
    if (idOrden && creadoMs && minutosAsignados) {
      const payload = {
        idOrden,
        creado: creadoMs,
        tiempoEntrega: Number(minutosAsignados),
        estado,
        titulo,
      };
      setOrdenActual(payload);
      upsertOrdenHistorial(payload);
    }
    navigation.navigate('Menu');
  };

  if (!idOrden) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: No se proporcionó el ID de la orden.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.tituloMini]}>{titulo}</Text>

      {estado === 'esperando' && (
        <>
          <Text style={styles.titulo}>Hemos recibido tu orden</Text>
          <Text style={styles.texto}>Esperando el tiempo de cocina…</Text>

          <TouchableOpacity style={[styles.boton, { backgroundColor: '#111827' }]} onPress={onSeguirOrdenando}>
            <Text style={[styles.botonTexto, { color: '#fff' }]}>SEGUIR ORDENANDO</Text>
          </TouchableOpacity>
        </>
      )}

      {estado === 'en progreso' && (
        <>
          {minutosAsignados != null && (
            <Text style={styles.asignado}>Tiempo asignado: {minutosAsignados} min</Text>
          )}
          {tiempoRestante !== null && (
            <>
              <Text style={styles.titulo}>Tu orden estará lista en:</Text>
              <Text style={styles.reloj}>{f(tiempoRestante)}</Text>
              <Text style={styles.texto}>Gracias por esperar.</Text>
            </>
          )}
          <TouchableOpacity style={[styles.boton, { backgroundColor: '#111827' }]} onPress={onSeguirOrdenando}>
            <Text style={[styles.botonTexto, { color: '#fff' }]}>SEGUIR ORDENANDO</Text>
          </TouchableOpacity>
        </>
      )}

      {estado === 'lista' && (
        <>
          <Text style={styles.tituloVerde}>¡ORDEN LISTA!</Text>
          <Text style={styles.texto}>Por favor, pasa a recoger tu pedido.</Text>
          <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('Menu')}>
            <Text style={styles.botonTexto}>SEGUIR ORDENANDO</Text>
          </TouchableOpacity>
        </>
      )}

      {!estado && <ActivityIndicator size="large" color="#000" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  tituloMini: { fontSize: 14, color: '#6b7280', marginBottom: 6 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#1f2937', marginBottom: 10, textAlign: 'center' },
  tituloVerde: { fontSize: 26, fontWeight: 'bold', color: 'black', marginBottom: 10, textAlign: 'center' },
  asignado: { fontSize: 16, fontWeight: '600', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#111827', color: '#fff', marginBottom: 10 },
  reloj: { fontSize: 48, fontWeight: 'bold', color: '#fbbf24', marginVertical: 20 },
  texto: { fontSize: 18, textAlign: 'center', marginBottom: 10 },
  error: { color: 'red', fontSize: 16 },
  boton: { backgroundColor: '#FFD700', padding: 15, marginTop: 30, borderRadius: 10, width: '80%', alignItems: 'center' },
  botonTexto: { fontWeight: 'bold', fontSize: 16 },
});
