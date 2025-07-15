import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export default function FormularioPedido() {
  const [estado, setEstado] = useState('esperando');
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const route = useRoute();
  const navigation = useNavigation();
  const { idOrden } = route.params ?? {};

  useEffect(() => {
    if (!idOrden) return;

    const unsubscribe = onSnapshot(doc(db, 'ordenes', idOrden), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setEstado(data.ordenLista ? 'lista' : data.tiempoEntrega ? 'en progreso' : 'esperando');

        if (data.tiempoEntrega && data.creado) {
          const tiempoMs = data.tiempoEntrega * 60 * 1000;
          const tiempoFinal = data.creado + tiempoMs;

          const interval = setInterval(() => {
            const restante = Math.max(0, Math.floor((tiempoFinal - Date.now()) / 1000));
            setTiempoRestante(restante);
            if (restante === 0) clearInterval(interval);
          }, 1000);

          return () => clearInterval(interval);
        }
      }
    });

    return () => unsubscribe();
  }, [idOrden]);

  const formatearTiempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const restoSegundos = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${restoSegundos.toString().padStart(2, '0')}`;
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
      {estado === 'esperando' && (
        <>
          <Text style={styles.titulo}>Hemos recibido tu orden</Text>
          <Text style={styles.texto}>Estamos calculando el tiempo de entrega...</Text>
        </>
      )}

      {estado === 'en progreso' && tiempoRestante !== null && (
        <>
          <Text style={styles.titulo}>Tu orden estará lista en:</Text>
          <Text style={styles.reloj}>{formatearTiempo(tiempoRestante)}</Text>
          <Text style={styles.texto}>Gracias por esperar.</Text>
        </>
      )}

      {estado === 'lista' && (
        <>
          <Text style={styles.tituloVerde}> ¡ORDEN LISTA!</Text>
          <Text style={styles.texto}>Por favor, pasa a recoger tu pedido.</Text>

          <TouchableOpacity
            style={styles.boton}
            onPress={() => navigation.navigate('Menu')}
          >
            <Text style={styles.botonTexto}>SEGUIR ORDENANDO</Text>
          </TouchableOpacity>
        </>
      )}

      {!estado && <ActivityIndicator size="large" color="#000" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {  
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    textAlign: 'center'
  },
  tituloVerde: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
    textAlign: 'center'
  },
  reloj: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginVertical: 20
  },
  texto: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10
  },
  error: {
    color: 'red',
    fontSize: 16
  },
  boton: {
    backgroundColor: '#FFD700',
    padding: 15,
    marginTop: 30,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center'
  },
  botonTexto: {
    fontWeight: 'bold',
    fontSize: 16
  }
});
