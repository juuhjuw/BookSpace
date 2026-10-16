import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useState } from "react";
import { CORES } from "../../theme";

//Armazenar os dados do usuário e do PIN
export default function Perfil({ navigation }) {
  const [usuario, setUsuario] = useState("");
  const [pin, setPin] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");


  //Função ao clicar no botão de login
  const handleLogin = () => {

    if (!usuario.trim() || !pin.trim()) {
      setMensagem("Por favor, preencha todos os campos.");
      return;
    }

    //Validar o PIN (exemplo: deve ter 4 dígitos)
    if (!/^\d{4}$/.test(pin)) { 
      setTipoMensagem("erro"); 
      setMensagem("O PIN deve ter 4 dígitos numéricos.");
      return;
    }

    console.log("Dados do login:", { usuario, pin });
    setTipoMensagem("sucesso");
    setMensagem("Login realizado com sucesso!");
    navigation?.navigate("Biblioteca");
  };

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
          value={usuario}
          onChangeText={(valor) => {
                    setUsuario(valor);
                    setMensagem("");
                  }}
          autoCapitalize="none"
        />
        <TextInput
          style={estilo.input}
          placeholder="PIN"
          placeholderTextColor={CORES.itemDesabilitado}
          secureTextEntry={true}
          keyboardType="number-pad"
          value={pin}
          onChangeText={(valor) => {
                    setPin(valor.replace(/\D/g, ""));
                    setMensagem("");
                  }}
          maxLength={4}
        />

        {mensagem !== "" && (
          <Text
            style={{
              color: tipoMensagem === "erro" ? "#D32F2F" : "#2E7D32",
              fontSize: 14,
              textAlign: "center",
              marginBottom: 12,
            }}
            accessibilityRole="alert"
          >
            {mensagem}
          </Text>
        )}

        <TouchableOpacity style={estilo.botao} onPress={handleLogin}>
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
    color: "#585858",
    backgroundColor: CORES.branco,
    marginBottom: 20,
  },
  ondaRodape: {
    width: "100%",
    height: 120,
  },
});
