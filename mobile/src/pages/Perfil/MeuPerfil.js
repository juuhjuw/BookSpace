
import React, { useState, useEffect } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { CORES } from "../../theme";

const CHAVE_PERFIL = "@BookSpace: perfil";

export default function MeuPerfil({ navigation, route }) {

  const [perfil, setPerfil] = useState(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");

  const [formularioAberto, setFormularioAberto] = useState(false);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    async function carregarPerfil(){
      try{
        const dadosSalvos = await AsyncStorage.getItem(CHAVE_PERFIL);

        if(dadosSalvos){
          const dados = JSON.parse(dadosSalvos);

          setPerfil({
            nome: dados.nome || "",
            email: dados.email || "",
            pin: dados.pin || "",
          });
        }
      }catch (erro){
        console.log("Erro ao carregar o Perfil: ", erro)
      }
    }
    carregarPerfil();
  }, []);

  function abrirCadastro() {
    setNome("");
    setEmail("");
    setPin("");
    setEditando(false);
    setFormularioAberto(true);
  }

  function abrirEdicao() {
    setNome(perfil.nome);
    setEmail(perfil.email);
    setPin(perfil.pin);
    setEditando(true);
    setFormularioAberto(true);
  }

  async function salvarPerfil() {
    if(!nome.trim() || !email.trim() || !pin.trim()){
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }  
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      Alert.alert("Atenção", "Digite um e-mail válido.");
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      Alert.alert("Atenção", "O PIN deve ter exatamente 4 números.");
      return;
    }

    const novoPerfil = {
      nome: nome.trim(),
       email: email.trim().toLowerCase(),
       pin,
     };

    try {
      await AsyncStorage.setItem(
      CHAVE_PERFIL,
      JSON.stringify(novoPerfil)
    );

    setPerfil(novoPerfil);
    setFormularioAberto(false);
    setEditando(false);

    Alert.alert(
      "Sucesso",
      editando
        ? "Perfil atualizado com sucesso!"
        : "Perfil adicionado com sucesso!"
    );
  } catch (erro) {
    console.log("Erro ao salvar perfil:", erro);
    Alert.alert("Erro", "Não foi possível salvar o perfil.");
    }
  }

function excluirPerfil() {
    async function confirmarExclusao(){
      try {
        await AsyncStorage.removeItem(CHAVE_PERFIL);

        setPerfil(null);
        setNome("");
        setEmail("");
        setPin("");
        setFormularioAberto(false);
        setEditando(false);

        navigation.reset({
          index: 0,
          routes: [{ name: "Inicio"}],
        });

        Alert.alert("Sucesso", "Perfil foi excluído com sucesso!");
      }catch (erro){
        console.log("Erro ao excluir o perfil: ", erro);
        Alert.alert("Erro", "Não foi possível concluir a exclusão do perfil!");
      }
    }
    if(Platform.OS === "web"){
      const confirmacao = window.confirm(
        "Tem certeza que deseja excluir seu perfil?"
      );
      if(confirmacao){
        confirmarExclusao();
      }
      return;
    }
    Alert.alert(
      "Excluir perfil",
      "Tem certeza que deseja excluir seu perfil?",
      [{
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Excluir",
        style: "destructive",
        onPress: confirmarExclusao,
      },]
    );
  }

  function cancelarFormulario() {
    setFormularioAberto(false);
    setEditando(false);
    setNome("");
    setEmail("");
    setPin("");
  }
  
  const BotVoltar = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={estilos.container}>
      <ScrollView
        contentContainerStyle={estilos.conteudo}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
          <Pressable
               onPress={BotVoltar}
               style={({ pressed }) => [
                 estilos.btnVoltar,
                 pressed && estilos.pressed,
               ]}
             >
               <Text style={estilos.btnVoltarText}>← Voltar</Text>
             </Pressable>

        <View style={estilos.cabecalho}>
          <View style={estilos.avatar}>
            <MaterialCommunityIcons
              name="account-cog-outline"
              size={42}
              color={CORES.roxo}
            />
          </View>

          <Text style={estilos.titulo}>Perfil e PIN</Text>
          <Text style={estilos.subtitulo}>
            Gerencie suas informações pessoais.
          </Text>
        </View>

        {/* READ: visualizar o perfil */}
        {!formularioAberto && perfil && (
          <View style={estilos.cartao}>
            <Text style={estilos.tituloCartao}>Meu perfil</Text>

            <Text style={estilos.rotulo}>Nome</Text>
            <Text style={estilos.valor}>{perfil.nome}</Text>

            <Text style={estilos.rotulo}>E-mail</Text>
            <Text style={estilos.valor}>{perfil.email}</Text>

            <Text style={estilos.rotulo}>PIN</Text>
            <Text style={estilos.valor}>{"•".repeat(perfil.pin.length)}</Text>

            <Pressable
              style={estilos.botao}
              onPress={abrirEdicao}
            >
              <MaterialCommunityIcons
                name="pencil-outline"
                size={20}
                color={CORES.branco}
              />
              <Text style={estilos.textoBotao}>Editar perfil</Text>
            </Pressable>

            <Pressable
              style={estilos.botaoExcluir}
              onPress={() => excluirPerfil()}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={20}
                color="#B42318"
              />
              <Text style={estilos.textoExcluir}>Excluir perfil</Text>
            </Pressable>
          </View>
        )}


        {!formularioAberto && !perfil && (
          <View style={estilos.cartaoVazio}>
            <MaterialCommunityIcons
              name="account-plus-outline"
              size={48}
              color={CORES.roxo}
            />

            <Text style={estilos.tituloCartao}>
              Nenhum perfil cadastrado
            </Text>

            <Text style={estilos.subtitulo}>
              Adicione suas informações para começar.
            </Text>

            <Pressable
              style={estilos.botao}
              onPress={abrirCadastro}
            >
              <MaterialCommunityIcons
                name="plus"
                size={21}
                color={CORES.branco}
              />
              <Text style={estilos.textoBotao}>Adicionar perfil</Text>
            </Pressable>
          </View>
        )}

        {formularioAberto && (
          <View style={estilos.cartao}>
            <Text style={estilos.tituloCartao}>
              {editando ? "Editar perfil" : "Adicionar perfil"}
            </Text>

            <Text style={estilos.rotulo}>Nome</Text>
            <TextInput
              style={estilos.input}
              placeholder="Digite seu nome"
              placeholderTextColor="#92899A"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
            />

            <Text style={estilos.rotulo}>E-mail</Text>
            <TextInput
              style={estilos.input}
              placeholder="Digite seu e-mail"
              placeholderTextColor="#92899A"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={estilos.rotulo}>PIN de 4 números</Text>
            <TextInput
              style={estilos.input}
              placeholder="Digite seu PIN"
              placeholderTextColor="#92899A"
              value={pin}
              onChangeText={(valor) =>
                setPin(valor.replace(/\D/g, "").slice(0, 4))
              }
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
            />

            <Pressable
              style={estilos.botao}
              onPress={salvarPerfil}
            >
              <MaterialCommunityIcons
                name="content-save-outline"
                size={20}
                color={CORES.branco}
              />
              <Text style={estilos.textoBotao}>
                {editando ? "Salvar alterações" : "Cadastrar perfil"}
              </Text>
            </Pressable>

            <Pressable
              style={estilos.botaoCancelar}
              onPress={cancelarFormulario}
            >
              <Text style={estilos.textoCancelar}>Cancelar</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
    );
  }

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },
  conteudo: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  voltar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 10,
  },
  textoVoltar: {
    color: CORES.roxo,
    fontSize: 15,
  },
  cabecalho: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 25,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#E8DDF8",
    alignItems: "center",
    justifyContent: "center",
  },
  titulo: {
    color: CORES.roxo,
    fontSize: 25,
    fontWeight: "700",
    marginTop: 12,
  },
  subtitulo: {
    color: CORES.textoSecundario,
    textAlign: "center",
    fontSize: 13,
    marginTop: 6,
  },
  cartao: {
    backgroundColor: CORES.branco,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CORES.borda,
    padding: 18,
  },
  cartaoVazio: {
    backgroundColor: CORES.branco,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CORES.borda,
    padding: 24,
    alignItems: "center",
  },
  tituloCartao: {
    color: CORES.roxo,
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 12,
  },
  rotulo: {
    color: CORES.texto,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 14,
    marginBottom: 6,
  },
  valor: {
    color: CORES.texto,
    fontSize: 15,
  },
  input: {
    backgroundColor: CORES.fundo,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: CORES.texto,
  },
  botao: {
    backgroundColor: CORES.roxo,
    borderRadius: 10,
    minHeight: 48,
    padding: 12,
    marginTop: 22,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  textoBotao: {
    color: CORES.branco,
    fontSize: 14,
    fontWeight: "700",
  },
  botaoExcluir: {
    borderWidth: 1,
    borderColor: "#B42318",
    borderRadius: 10,
    minHeight: 48,
    padding: 12,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  textoExcluir: {
    color: "#B42318",
    fontWeight: "700",
    fontSize: 14,
  },
  botaoCancelar: {
    padding: 14,
    alignItems: "center",
    marginTop: 5,
  },
  textoCancelar: {
    color: CORES.textoSecundario,
    fontSize: 14,
  },
   btnVoltarText: {
    color: CORES.roxo,
    fontSize: 14,
  },
    pressed: {
    opacity: 0.8,
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
});

