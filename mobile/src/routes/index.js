import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AreaApoio from "../pages/AreaApoio";
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
    </Stack.Navigator>
  );
}
