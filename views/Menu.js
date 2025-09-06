// views/Menu.js
import React, { useEffect, useState, useLayoutEffect, useContext } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useNavigation } from '@react-navigation/native';
import { PedidoContext } from '../components/PedidoContext';


export default function Menu() {
  const [platillos, setPlatillos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { pedido } = useContext(PedidoContext);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'producto'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlatillos(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useLayoutEffect(() => {
  navigation.setOptions({
    headerTitle: 'Menu',
    headerTitleAlign: 'center', // opcional: centra el título
    // Botón IZQUIERDO: "Estado"
    headerLeft: () => (
      <TouchableOpacity
        onPress={() => navigation.navigate('EstadoPedido')}
        style={{ paddingHorizontal: 12 }}
      >
        <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#000' }}>
          Estado
        </Text>
      </TouchableOpacity>
    ),
    // Botón DERECHO: "Ir a Pedido" + badge
    headerRight: () => (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ResumenPedido')}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#000' }}>
            Ir a Pedido
          </Text>
          {(pedido?.length ?? 0) > 0 && (
            <View
              style={{
                backgroundColor: 'red',
                borderRadius: 10,
                marginLeft: 4,
                paddingHorizontal: 6,
                paddingVertical: 1,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>
                {pedido.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    ),
  });
}, [navigation, pedido?.length]);


  const categoriasAgrupadas = platillos.reduce((acc, item) => {
    if (!acc[item.categoria]) acc[item.categoria] = [];
    acc[item.categoria].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.descripcionBox}>
        <Text style={styles.tituloDescripcion}>Nuestro Menú</Text>
        <Text style={styles.descripcion}>
          Selecciona uno de nuestros deliciosos platillos disponibles.
        </Text>
      </View>

      {Object.keys(categoriasAgrupadas).map((categoria) => (
        <View key={categoria}>
          <Text style={styles.categoria}>{categoria.toUpperCase()}</Text>
          {categoriasAgrupadas[categoria].map((item) => (
            <TouchableOpacity
              key={item.id}
              disabled={!item.existencia}
              style={[styles.card, !item.existencia && styles.cardAgotado]}
              onPress={() => navigation.navigate('DetallePlatillo', { platillo: item })}
            >
              <Image source={{ uri: item.imagen }} style={styles.imagen} />
              <View style={styles.info}>
                <Text style={styles.nombre}>{item.nombre}</Text>
                <Text style={styles.descripcionItem}>{item.descripcion}</Text>
                <Text style={styles.precio}>
                  {item.existencia ? `Precio: Q${item.precio}` : 'AGOTADO'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10, backgroundColor: '#fff', flex: 1 },
  descripcionBox: { backgroundColor: '#e3f2fd', padding: 15, borderRadius: 10, marginBottom: 20 },
  tituloDescripcion: { fontSize: 18, fontWeight: 'bold' },
  descripcion: { color: '#555', marginTop: 4 },
  categoria: {
    backgroundColor: '#000', color: '#fff', padding: 6, paddingLeft: 12,
    fontWeight: 'bold', borderRadius: 6, marginBottom: 8,
  },
  card: { flexDirection: 'row', backgroundColor: '#fafafa', padding: 8, borderRadius: 10, marginBottom: 10, elevation: 3 },
  cardAgotado: { opacity: 0.4 },
  imagen: { width: 80, height: 80, borderRadius: 10 },
  info: { flex: 1, marginLeft: 10 },
  nombre: { fontWeight: 'bold' },
  descripcionItem: { fontSize: 13, color: '#666' },
  precio: { marginTop: 4, fontWeight: 'bold' },
  cargando: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
