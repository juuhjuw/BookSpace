import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { CORES } from "../../theme";

const PIN_PADRAO = "1234";

export default function PIN({ navigation, onVoltar, onSucesso }) {
  const [pin, setPin] = useState("");

  const BotVoltar = () => {
    if (onVoltar) return onVoltar();
    if (navigation?.goBack) navigation.goBack();
  };

  const Entrar = () => {
    if (pin === PIN_PADRAO) {
      if (onSucesso) return onSucesso();
    } else {
      Alert.alert("PIN incorreto", "Confira o código e tente novamente.");
      setPin("");
    }
  };

  return (
    <SafeAreaView style={estilo.safe}>
      <KeyboardAvoidingView
        style={estilo.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View>
          <Pressable
            onPress={BotVoltar}
            style={({ pressed }) => [
              estilo.btnVoltar,
              pressed && estilo.pressed,
            ]}
          >
            <Text style={estilo.btnVoltarText}>← Voltar</Text>
          </Pressable>

          <Text style={estilo.titulo}>Notas da editora</Text>
          <Text style={estilo.descricao}>
            Digite o código de acesso para visualizar o conteúdo exclusivo.
          </Text>

          <View style={estilo.card}>
            <Text style={estilo.label}>Código PIN de 4 dígitos:</Text>

            <TextInput
              style={estilo.input}
              value={pin}
              onChangeText={(t) => setPin(t.replace(/\D/g, ""))}
              placeholder="..."
              placeholderTextColor={CORES.texto}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              textAlign="center"
              onSubmitEditing={Entrar}
            />

            <Pressable
              onPress={Entrar}
              style={({ pressed }) => [
                estilo.btnEntrar,
                pressed && estilo.pressed,
              ]}
            >
              <Text style={estilo.btnEntrarText}>Entrar</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilo = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: CORES.branco,
  },
  container: {
    flex: 1,
    //justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: CORES.fundo,
  },

  btnVoltar: {
    alignSelf: "flex-start",
    backgroundColor: CORES.fundo,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 32,
  },
  btnVoltarText: {
    color: CORES.roxo,
    fontSize: 14,
  },

  titulo: {
    fontSize: 18,
    fontWeight: "700",
    color: CORES.roxo,
    marginBottom: 6,
  },
  descricao: {
    fontSize: 16,
    lineHeight: 22,
    color: CORES.textoSecundario,
    marginBottom: 26,
  },

  card: {
    backgroundColor: CORES.branco,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 14,
    padding: 12,
  },
  label: {
    fontSize: 13,
    color: CORES.textoSecundario,
    marginBottom: 10,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#e0dde0",
    borderRadius: 10,
    backgroundColor: CORES.branco,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 6,
    color: CORES.texto,
    marginBottom: 18,
  },
  btnEntrar: {
    height: 40,
    backgroundColor: CORES.roxo,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  btnEntrarText: {
    color: CORES.branco,
    fontSize: 14,
  },
  pressed: {
    opacity: 0.8,
  },
});
