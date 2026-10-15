import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AreaApoio from "../pages/AreaApoio";
import Perfil from "../pages/Perfil/Perfil";
import TelaDiario from "../pages/Diario/index";
import { CORES } from "../theme";

const Stack = createNativeStackNavigator();

export default function Routes() {
  return (
    <Stack.Navigator
      //ROTA INICIAL CORRETA
      /*initialRouteName="Perfil"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: {
          backgroundColor: CORES.fundo,*/

      //ABRI DIRETO PRA TESTAR
      initialRouteName="Diario"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: {
          backgroundColor: CORES.fundo,
        },
      }}
    >
      <Stack.Screen name="AreaApoio" component={AreaApoio} />
      <Stack.Screen name="Perfil" component={Perfil} />
      <Stack.Screen name="Diario" component={TelaDiario} />
    </Stack.Navigator>
  );
}
