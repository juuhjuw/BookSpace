import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { CORES } from "../../theme";
import { requisitar } from "../../services/api";
import { salvarUsuarioAtual } from "../../services/session";

//Armazenar os dados do usuário e do PIN
export default function Inicio({ navigation }) {
  const [usuario, setUsuario] = useState("");
  const [pin, setPin] = useState("");
  const [nome, setNome] = useState("");
  const [criandoConta, setCriandoConta] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");


  const handleLogin = async () => {
    if (carregando) return;
    if (!usuario.trim() || !pin.trim()) {
      setTipoMensagem("erro");
      setMensagem("Por favor, preencha todos os campos.");
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setTipoMensagem("erro");
      setMensagem("O PIN deve ter 4 dígitos numéricos.");
      return;
    }

    if (criandoConta && !nome.trim()) {
      setTipoMensagem("erro");
      setMensagem("Informe seu nome para criar o perfil.");
      return;
    }

    setCarregando(true);
    try {
      const emailDigitado = usuario.trim().toLowerCase();
      const perfil = await requisitar(
        criandoConta ? "/usuarios" : "/usuarios/login",
        {
          method: "POST",
          exigirToken: false,
          body: JSON.stringify(
            criandoConta
              ? { nome: nome.trim(), email: emailDigitado, pin }
              : { email: emailDigitado, pin },
          ),
        },
      );
      await salvarUsuarioAtual({ ...perfil.usuario, token: perfil.token });
      navigation.reset({ index: 0, routes: [{ name: "Biblioteca" }] });
    } catch (erro) {
      setTipoMensagem("erro");
      setMensagem(erro.message || "Não foi possível concluir a operação.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={estilo.container}>
      <Text style={estilo.tituloPag}>BookSpace</Text>

      <View style={estilo.centro}>
        <Text style={estilo.subtitulo}>
          {criandoConta ? "Criar perfil" : "Bem-vinda"}
        </Text>

        <Text style={estilo.recado}>
          Seu espaço seguro para ler, explorar e se fortalecer
        </Text>

        <TextInput
          style={estilo.input}
          placeholder="E-mail"
          placeholderTextColor={CORES.itemDesabilitado}
          value={usuario}
          onChangeText={(valor) => {
                    setUsuario(valor);
                    setMensagem("");
                  }}
          autoCapitalize="none"
        />
        {criandoConta && (
          <TextInput
            style={estilo.input}
            placeholder="Nome"
            placeholderTextColor={CORES.itemDesabilitado}
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
          />
        )}
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

        <TouchableOpacity
          style={estilo.botao}
          onPress={handleLogin}
          disabled={carregando}
        >
          <Text
            style={{ color: CORES.branco, fontSize: 18, fontWeight: "bold" }}
          >
            {carregando ? "Aguarde..." : criandoConta ? "Criar perfil" : "Entrar"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setCriandoConta((atual) => !atual);
            setMensagem("");
          }}
        >
          <Text style={estilo.alternarConta}>
            {criandoConta ? "Já tenho perfil: entrar" : "Criar novo perfil"}
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
  alternarConta: {
    color: CORES.roxo,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 16,
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
