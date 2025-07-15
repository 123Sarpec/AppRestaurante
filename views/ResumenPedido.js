import React, { useContext, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
import { PedidoContext } from '../components/PedidoContext';
import { useNavigation } from '@react-navigation/native';
import { enviarOrdenAFirebase } from '../firebase/enviarOrden';

export default function ResumenPedido() {
  const { pedido, eliminarDelPedido, limpiarPedido } = useContext(PedidoContext);
  const navigation = useNavigation();
  const [enviando, setEnviando] = useState(false);

  const total = pedido.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

  const handleEliminar = (id) => {
    Alert.alert('¿Eliminar?', '¿Deseas eliminar este platillo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', onPress: () => eliminarDelPedido(id), style: 'destructive' }
    ]);
  };

  const enviarOrden = () => {
    if (pedido.length === 0) {
      Alert.alert('Pedido vacío', 'Debes agregar al menos un platillo.', [{ text: 'OK' }]);
      return;
    }

    Alert.alert(
      'Confirmar',
      '¿Antes de enviar la orden, Verfica tus platillos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: async () => {
            if (enviando) return;
            setEnviando(true);

            const idOrden = await enviarOrdenAFirebase(pedido, total);
            setEnviando(false);

            if (idOrden) {
              Alert.alert('Orden enviada', 'Tu orden fue enviada con éxito.');
              limpiarPedido();
              navigation.navigate('FormularioPlatillo', { idOrden });
            } else {
              Alert.alert('Error', 'No se pudo enviar la orden.');
            }
          }
        }
      ]
    );
  };

  if (pedido.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>No hay platillos agregados</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Resumen Pedido</Text>
      <FlatList
        data={pedido}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.imagen }} style={styles.imagen} />
            <View style={styles.info}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text>Cantidad: {item.cantidad}</Text>
              <Text>Precio unitario: Q{item.precio}</Text>
              <Text style={styles.subtotalItem}>Subtotal: Q{item.cantidad * item.precio}</Text>
            </View>
            <TouchableOpacity style={styles.btnEliminar} onPress={() => handleEliminar(item.id)}>
              <Text style={styles.btnEliminarTexto}>ELIMINAR</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Text style={styles.total}>Total a Pagar: Q{total}</Text>
      <TouchableOpacity style={styles.btnNegro} onPress={() => navigation.navigate('Menu')}>
        <Text style={styles.btnNegroTexto}>SEGUIR PIDIENDO</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btnAmarillo, enviando && { opacity: 0.6 }]}
        onPress={enviarOrden}
        disabled={enviando}
      >
        <Text style={styles.btnAmarilloTexto}>
          {enviando ? 'ENVIANDO...' : 'ORDENAR PEDIDO'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flex: 1 },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  imagen: { width: 80, height: 80, borderRadius: 10, marginRight: 15 },
  info: { flex: 1 },
  nombre: { fontSize: 16, fontWeight: 'bold' },
  subtotalItem: { fontWeight: 'bold', color: '#333', marginTop: 4 },
  btnEliminar: { backgroundColor: 'red', padding: 10, borderRadius: 5 },
  btnEliminarTexto: { color: '#fff', fontWeight: 'bold' },
  total: { fontSize: 18, fontWeight: 'bold', marginVertical: 25, textAlign: 'center' },
  btnNegro: { backgroundColor: '#000', padding: 15, borderRadius: 5, alignItems: 'center', marginBottom: 15 },
  btnNegroTexto: { color: '#fff', fontWeight: 'bold' },
  btnAmarillo: { backgroundColor: '#FFD700', padding: 15, borderRadius: 5, alignItems: 'center' },
  btnAmarilloTexto: { color: '#000', fontWeight: 'bold' },
});
