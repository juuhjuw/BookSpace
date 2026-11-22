import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { CommonActions } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { CORES } from "../../theme";
import { requisitar } from "../../services/api";
import { limparUsuarioAtual, obterUsuarioAtual, salvarUsuarioAtual } from "../../services/session";

export default function MeuPerfil({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [editando, setEditando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    async function carregarPerfil() {
      try {
        const sessao = await obterUsuarioAtual();
        if (!sessao) throw new Error("Entre novamente para acessar seu perfil.");
        const perfil = await requisitar(`/usuarios/${sessao.id}`);
        if (!ativo) return;
        setUsuario({ ...perfil, token: sessao.token });
        setNome(perfil.nome);
        setEmail(perfil.email);
      } catch (falha) {
        if (ativo) setErro(falha.message);
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    carregarPerfil();
    return () => { ativo = false; };
  }, []);

  function sairRapido() {
    navigation.dispatch(CommonActions.reset({
      index: 0,
      routes: [{ name: "Biblioteca" }],
    }));
  }

  async function salvarPerfil() {
    if (!nome.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErro("Informe seu nome e um e-mail válido.");
      return;
    }
    if (pin && !/^\d{4}$/.test(pin)) {
      setErro("O novo PIN deve conter quatro números.");
      return;
    }

    setSalvando(true);
    setErro("");
    try {
      const resposta = await requisitar(`/usuarios/${usuario.id}`, {
        method: "PUT",
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          ...(pin ? { pin } : {}),
        }),
      });
      const atualizado = { ...usuario, ...resposta };
      setUsuario(atualizado);
      await salvarUsuarioAtual(atualizado);
      setPin("");
      setEditando(false);
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setSalvando(false);
    }
  }

  function excluirPerfil() {
    async function confirmar() {
      try {
        await requisitar(`/usuarios/${usuario.id}`, { method: "DELETE" });
        await limparUsuarioAtual();
        navigation.dispatch(CommonActions.reset({
          index: 0,
          routes: [{ name: "Inicio" }],
        }));
      } catch (falha) {
        setErro(falha.message);
      }
    }

    async function sair() {
      await limparUsuarioAtual();
      navigation.dispatch(CommonActions.reset({
        index: 0,
        routes: [{ name: "Inicio" }],
      }));
    }

    if (Platform.OS === "web") {
      if (window.confirm("Isso também excluirá os registros associados. Deseja continuar?")) {
        confirmar();
      }
      return;
    }

    Alert.alert("Excluir perfil", "Isso também excluirá os registros associados. Deseja continuar?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: confirmar },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <Pressable onPress={sairRapido} style={styles.voltar}>
          <Text style={styles.textoVoltar}>Marcar-página · Biblioteca</Text>
        </Pressable>
        <View style={styles.cabecalho}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account-cog-outline" size={42} color={CORES.roxo} />
          </View>
          <Text style={styles.titulo}>Perfil e PIN</Text>
          <Text style={styles.subtitulo}>Gerencie suas informações pessoais.</Text>
        </View>

        {carregando ? <Text style={styles.subtitulo}>Carregando perfil...</Text> : null}
        {!!erro && <Text accessibilityRole="alert" style={styles.erro}>{erro}</Text>}

        {!carregando && usuario && (
          <View style={styles.cartao}>
            <Text style={styles.tituloCartao}>{editando ? "Editar perfil" : "Meu perfil"}</Text>
            <Text style={styles.rotulo}>Nome</Text>
            {editando ? (
              <TextInput style={styles.input} value={nome} onChangeText={setNome} />
            ) : <Text style={styles.valor}>{usuario.nome}</Text>}
            <Text style={styles.rotulo}>E-mail</Text>
            {editando ? (
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : <Text style={styles.valor}>{usuario.email}</Text>}
            {editando && (
              <>
                <Text style={styles.rotulo}>Novo PIN (opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={pin}
                  onChangeText={(valor) => setPin(valor.replace(/\D/g, "").slice(0, 4))}
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={4}
                  placeholder="Deixe vazio para manter"
                />
              </>
            )}
            <Pressable
              style={styles.botao}
              onPress={editando ? salvarPerfil : () => setEditando(true)}
              disabled={salvando}
            >
              <Text style={styles.textoBotao}>
                {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Editar perfil"}
              </Text>
            </Pressable>
            {editando ? (
              <Pressable style={styles.botaoCancelar} onPress={() => {
                setNome(usuario.nome);
                setEmail(usuario.email);
                setPin("");
                setEditando(false);
                setErro("");
              }}>
                <Text style={styles.textoVoltar}>Cancelar</Text>
              </Pressable>
            ) : (
              <>
                <Pressable style={styles.botaoCancelar} onPress={sair}>
                  <Text style={styles.textoVoltar}>Sair deste perfil</Text>
                </Pressable>
                <Pressable style={styles.botaoExcluir} onPress={excluirPerfil}>
                  <Text style={styles.textoExcluir}>Excluir perfil e registros</Text>
                </Pressable>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CORES.fundo },
  conteudo: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  voltar: { alignSelf: "flex-start", paddingVertical: 10 },
  textoVoltar: { color: CORES.roxo, fontSize: 14, fontWeight: "600" },
  cabecalho: { alignItems: "center", marginTop: 18, marginBottom: 24 },
  avatar: {
    width: 82, height: 82, borderRadius: 41, backgroundColor: "#E8DDF8",
    alignItems: "center", justifyContent: "center",
  },
  titulo: { color: CORES.roxo, fontSize: 25, fontWeight: "700", marginTop: 12 },
  subtitulo: { color: CORES.textoSecundario, textAlign: "center", fontSize: 13, marginTop: 6 },
  cartao: { backgroundColor: CORES.branco, borderRadius: 14, borderWidth: 1, borderColor: CORES.borda, padding: 18 },
  tituloCartao: { color: CORES.roxo, fontSize: 19, fontWeight: "700", marginBottom: 12 },
  rotulo: { color: CORES.texto, fontSize: 13, fontWeight: "600", marginTop: 14, marginBottom: 6 },
  valor: { color: CORES.texto, fontSize: 15 },
  input: { backgroundColor: CORES.fundo, borderWidth: 1, borderColor: CORES.borda, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15, color: CORES.texto },
  botao: { backgroundColor: CORES.roxo, borderRadius: 10, minHeight: 48, padding: 12, marginTop: 22, alignItems: "center", justifyContent: "center" },
  textoBotao: { color: CORES.branco, fontSize: 14, fontWeight: "700" },
  botaoCancelar: { padding: 14, alignItems: "center", marginTop: 5 },
  botaoExcluir: { borderWidth: 1, borderColor: CORES.vermelho, borderRadius: 10, minHeight: 48, padding: 12, marginTop: 10, alignItems: "center", justifyContent: "center" },
  textoExcluir: { color: CORES.vermelho, fontWeight: "700", fontSize: 14 },
  erro: { color: CORES.vermelho, textAlign: "center", marginBottom: 12 },
});
