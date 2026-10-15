import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";

import { CORES } from "../../theme";

export default function Perfil() {
  return (
    <View style={estilo.container}>
      <Text style={estilo.tituloPag}>BookSpace</Text>

      <View style={estilo.centro}>
        <Text style={estilo.subtitulo}>Bem-Vinda</Text>

        <Text style={estilo.recado}>
          Seu espaço seguro para ler, explorar e se fortalecer
        </Text>

        <TextInput
          style={estilo.input}
          placeholder="Email ou usuária"
          placeholderTextColor={CORES.itemDesabilitado}
        />
        <TextInput
          style={estilo.input}
          placeholder="PIN"
          placeholderTextColor={CORES.itemDesabilitado}
          secureTextEntry={true}
        />
        <TouchableOpacity style={estilo.botao}>
          <Text
            style={{ color: CORES.branco, fontSize: 18, fontWeight: "bold" }}
          >
            Entrar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const estilo = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "space-between",
    backgroundColor: CORES.fundo,
  },
  headerTopo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  logo: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 10,
  },
  tituloPag: {
    color: CORES.roxo,
    fontWeight: "bold",
    fontSize: 25,
  },
  centro: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 30,
    marginTop: 250,
  },
  subtitulo: {
    color: CORES.roxo,
    fontWeight: "bold",
    fontSize: 35,
    marginBottom: 5,
  },
  recado: {
    color: "#8965BF",
    fontSize: 12,
    marginBottom: 25,
    textAlign: "center",
  },
  botao: {
    backgroundColor: CORES.roxo,
    borderRadius: 30,
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: CORES.roxo,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#BABABA",
    backgroundColor: CORES.branco,
    marginBottom: 20,
  },
  ondaRodape: {
    width: "100%",
    height: 120,
  },
});
