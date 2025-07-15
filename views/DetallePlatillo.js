import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function DetallePlatillo({ route }) {
  const { platillo } = route.params;
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Image source={{ uri: platillo.imagen }} style={styles.imagen} />
      <Text style={styles.nombre}>{platillo.nombre}</Text>
      <Text style={styles.descripcion}>{platillo.descripcion}</Text>
      <Text style={styles.precio}>Precio: Q{platillo.precio}</Text>

      <TouchableOpacity
        style={styles.boton}
        onPress={() => navigation.navigate('ProgresoPedido', { platillo })}
      >
        <Text style={styles.botonTexto}>ORDENAR PLATILLO</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  imagen: { width: '100%', height: 200, borderRadius: 10 },
  nombre: { fontSize: 24, fontWeight: 'bold', marginVertical: 10 },
  descripcion: { fontSize: 16, color: '#666' },
  precio: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  boton: {
    backgroundColor: '#FFD700',
    padding: 15,
    alignItems: 'center',
    marginTop: 30,
    borderRadius: 8,
  },
  botonTexto: { fontWeight: 'bold', fontSize: 16 },
});
