import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PedidoContext } from '../components/PedidoContext';

export default function ProgresoPedido({ route }) {
  const { platillo } = route.params;
  const navigation = useNavigation();
  const [cantidad, setCantidad] = useState(1);
  const { agregarAlPedido } = useContext(PedidoContext);

  const incrementar = () => setCantidad(cantidad + 1);
  const decrementar = () => {
    if (cantidad > 1) setCantidad(cantidad - 1);
  };

  const confirmarPedido = () => {
    Alert.alert(
      '¿Deseas confirmar tu pedido?',
      'Un pedido confirmado ya no se podrá modificar',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            agregarAlPedido({ ...platillo, cantidad });
            navigation.navigate('ResumenPedido');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Cantidad</Text>
      <View style={styles.contador}>
        <TouchableOpacity onPress={decrementar} style={styles.botonContador}>
          <Text style={styles.textoBoton}>-</Text>
        </TouchableOpacity>
        <Text style={styles.cantidad}>{cantidad}</Text>
        <TouchableOpacity onPress={incrementar} style={styles.botonContador}>
          <Text style={styles.textoBoton}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtotal}>Subtotal: Q{platillo.precio * cantidad}</Text>
      <TouchableOpacity style={styles.boton} onPress={confirmarPedido}>
        <Text style={styles.botonTexto}>AGREGAR AL PEDIDO</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#eee' },
  titulo: { fontSize: 24, textAlign: 'center', marginVertical: 20 },
  contador: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  botonContador: {
    backgroundColor: '#000',
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  textoBoton: { color: '#fff', fontSize: 20 },
  cantidad: { fontSize: 24 },
  subtotal: { textAlign: 'center', fontSize: 20, marginBottom: 30 },
  boton: {
    backgroundColor: '#FFD700',
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
  },
  botonTexto: { fontWeight: 'bold', fontSize: 16 },
});
