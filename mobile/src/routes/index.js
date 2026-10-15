import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AreaApoio from "../pages/AreaApoio";
import Perfil from "../pages/Perfil/Perfil";
import PIN from "../pages/Perfil/PIN";
import RedeApoio from "../pages/RedeApoio";
import Autoavaliacao from "../pages/Autoavaliacao";
import TelaDiario from "../pages/Diario/index";
import { CORES } from "../theme";

const Stack = createNativeStackNavigator();

export default function Routes() {
  return (
    <Stack.Navigator
      initialRouteName="Diario"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: {
          backgroundColor: CORES.fundo,
        },
      }}
    >
      <Stack.Screen name="Perfil" component={Perfil} />
      <Stack.Screen name="PIN" component={PIN} />
      <Stack.Screen name="AreaApoio" component={AreaApoio} />
      <Stack.Screen name="RedeApoio" component={RedeApoio} />
      <Stack.Screen name="Diario" component={TelaDiario} />
      <Stack.Screen name="Autoavaliação" component={Autoavaliacao} />

    </Stack.Navigator>
  );
}
