import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AreaApoio from "../pages/AreaApoio";
import Perfil from "../pages/Perfil/Perfil";
import RedeApoio from "../pages/RedeApoio";
import TelaDiario from "../pages/Diario";
import { CORES } from "../theme";

const Stack = createNativeStackNavigator();

export default function Routes() {
  return (
    <Stack.Navigator
      initialRouteName="AreaApoio"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: {
          backgroundColor: CORES.fundo,
        },
      }}
    >
      <Stack.Screen name="AreaApoio" component={AreaApoio} />
      <Stack.Screen name="RedeApoio" component={RedeApoio} />
      <Stack.Screen name="Perfil" component={Perfil} />
      <Stack.Screen name="Diario" component={TelaDiario} />
    </Stack.Navigator>
  );
}
