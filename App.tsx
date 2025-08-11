import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Menu from './views/Menu';
import DetallePlatillo from './views/DetallePlatillo';
import FormularioPlatillo from './views/FormularioPlatillo';
import NuevaOrden from './views/NuevaOrden';
import ProgresoPedido from './views/ProgresoPedido';
import ResumenPedido from './views/ResumenPedido';
import EstadoPedido from './views/EstadoPedido'; 


import { PedidoProvider } from './components/PedidoContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PedidoProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Menu"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#FFD700', // Color amarillo
            },
            headerTintColor: '#000',
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen name="Menu" component={Menu} />
          <Stack.Screen name="DetallePlatillo" component={DetallePlatillo} />
          <Stack.Screen name="FormularioPlatillo" component={FormularioPlatillo} />
          <Stack.Screen name="NuevaOrden" component={NuevaOrden} />
          <Stack.Screen name="ProgresoPedido" component={ProgresoPedido} />
          <Stack.Screen name="ResumenPedido" component={ResumenPedido} />
          <Stack.Screen name="EstadoPedido" component={EstadoPedido} />
          
        </Stack.Navigator>
      </NavigationContainer>
    </PedidoProvider>
  );
}
