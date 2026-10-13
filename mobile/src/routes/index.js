import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Perfil from "../pages/Perfil"

const Stack = createNativeStackNavigator();

export default function Rotas(){
    return(
        <Stack.Navigator>
            <Stack.Screen
                 name="Perfil" 
                component={Perfil} 
            />
        </Stack.Navigator>
    )
}
