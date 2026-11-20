import { CommonActions } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { CORES } from "../../theme";
import { requisitar } from "../../services/api";
import { obterUsuarioAtual } from "../../services/session";

export default function RedeApoio({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const [contatos, setContatos] = useState([]);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [prioridade, setPrioridade] = useState("1");
  const [idEditando, setIdEditando] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function carregarContatos() {
    setCarregando(true);
    setErro("");
    try {
      const sessao = await obterUsuarioAtual();
      if (!sessao) throw new Error("Entre novamente para acessar sua rede de apoio.");
      setUsuario(sessao);
      setContatos(await requisitar(`/rede-apoio?user_id=${sessao.id}`));
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregarContatos(); }, []);

  function limparFormulario() {
    setNome("");
    setTelefone("");
    setPrioridade("1");
    setIdEditando(null);
  }

  function iniciarEdicao(contato) {
    setIdEditando(contato.id);
    setNome(contato.nome_contato);
    setTelefone(contato.telefone);
    setPrioridade(String(contato.prioridade || 1));
    setErro("");
  }

  async function salvarContato() {
    const prioridadeNumero = Number(prioridade);
    if (!nome.trim() || !telefone.trim() || !Number.isInteger(prioridadeNumero) ||
        prioridadeNumero < 1 || prioridadeNumero > 5) {
      setErro("Informe nome, telefone e prioridade de 1 a 5.");
      return;
    }
    if (!usuario || salvando) return;

    setSalvando(true);
    setErro("");
    try {
      await requisitar(idEditando === null ? "/rede-apoio" : `/rede-apoio/${idEditando}`, {
        method: idEditando === null ? "POST" : "PUT",
        body: JSON.stringify({
          user_id: usuario.id,
          nome_contato: nome.trim(),
          telefone: telefone.trim(),
          prioridade: prioridadeNumero,
        }),
      });
      limparFormulario();
      await carregarContatos();
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluirContato(id) {
    try {
      await requisitar(`/rede-apoio/${id}?user_id=${usuario.id}`, { method: "DELETE" });
      setContatos((atuais) => atuais.filter((contato) => contato.id !== id));
      if (idEditando === id) limparFormulario();
    } catch (falha) {
      setErro(falha.message);
    }
  }

  function confirmarExclusao(contato) {
    if (Platform.OS === "web") {
      if (window.confirm(`Excluir o contato ${contato.nome_contato}?`)) {
        excluirContato(contato.id);
      }
      return;
    }
    Alert.alert("Excluir contato", `Deseja excluir ${contato.nome_contato}?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => excluirContato(contato.id) },
    ]);
  }

  function marcarPagina() {
    navigation.dispatch(CommonActions.reset({
      index: 0,
      routes: [{ name: "Biblioteca" }],
    }));
  }

  return (
    <SafeAreaView style={styles.areaSegura}>
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <View style={styles.cabecalho}>
          <View style={styles.blocoTitulo}>
            <Text accessibilityRole="header" style={styles.titulo}>Rede de Apoio</Text>
            <Text style={styles.subtitulo}>Na fachada, é exibido como “Contatos Frequentes”.</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Marcar página" onPress={marcarPagina} style={styles.botaoMarcaPagina}>
            <Text style={styles.textoMarcaPagina}>Marcar-página</Text>
            <MaterialCommunityIcons name="location-exit" size={20} color={CORES.texto} />
          </Pressable>
        </View>

        <Text accessibilityRole="header" style={styles.tituloSecao}>Contatos de Confiança</Text>
        {carregando && <Text style={styles.subtitulo}>Carregando contatos...</Text>}
        {!carregando && contatos.length === 0 && (
          <View style={styles.cartaoListaVazia}>
            <Text style={styles.listaVazia}>Nenhum contato cadastrado.</Text>
          </View>
        )}
        {contatos.map((contato) => (
          <View key={contato.id} style={styles.cartaoContato}>
            <View style={styles.informacoesContato}>
              <Text style={styles.nomeContato}>{contato.nome_contato}</Text>
              <Text selectable style={styles.telefoneContato}>{contato.telefone}</Text>
              <Text style={styles.textoSelo}>Prioridade {contato.prioridade}</Text>
            </View>
            <View style={styles.acoesContato}>
              <Pressable accessibilityRole="button" onPress={() => iniciarEdicao(contato)}>
                <Text style={styles.textoAcao}>Editar</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => confirmarExclusao(contato)}>
                <Text style={styles.textoExcluir}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <View style={styles.formulario}>
          <Text accessibilityRole="header" style={styles.tituloFormulario}>
            {idEditando === null ? "Novo contato de confiança" : "Editar contato"}
          </Text>
          <TextInput
            accessibilityLabel="Nome ou apelido do contato"
            placeholder="Nome ou apelido"
            placeholderTextColor={CORES.itemDesabilitado}
            value={nome}
            onChangeText={setNome}
            style={styles.campo}
          />
          <TextInput
            accessibilityLabel="Telefone com DDD"
            placeholder="Telefone com DDD"
            placeholderTextColor={CORES.itemDesabilitado}
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
            style={styles.campo}
          />
          <TextInput
            accessibilityLabel="Prioridade do contato de 1 a 5"
            placeholder="Prioridade (1 a 5)"
            placeholderTextColor={CORES.itemDesabilitado}
            value={prioridade}
            onChangeText={(valor) => setPrioridade(valor.replace(/\D/g, "").slice(0, 1))}
            keyboardType="number-pad"
            maxLength={1}
            style={styles.campo}
          />
          {!!erro && <Text accessibilityRole="alert" style={styles.erro}>{erro}</Text>}
          <Pressable accessibilityRole="button" onPress={salvarContato} disabled={salvando} style={styles.botaoSalvar}>
            <Text style={styles.textoBotaoSalvar}>
              {salvando ? "Salvando..." : idEditando === null ? "Salvar contato" : "Salvar alterações"}
            </Text>
          </Pressable>
          {idEditando !== null && (
            <Pressable onPress={limparFormulario} style={styles.botaoCancelar}>
              <Text style={styles.textoAcao}>Cancelar edição</Text>
            </Pressable>
          )}
        </View>

        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.botaoVoltar}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={CORES.roxo} />
          <Text style={styles.textoAcao}>Voltar</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  areaSegura: { flex: 1, backgroundColor: CORES.fundo },
  conteudo: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24, gap: 18 },
  cabecalho: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  blocoTitulo: { flex: 1, gap: 6 },
  titulo: { color: CORES.roxo, fontSize: 24, fontWeight: "700" },
  subtitulo: { color: CORES.textoSecundario, fontSize: 13, lineHeight: 18 },
  botaoMarcaPagina: { minHeight: 48, paddingHorizontal: 12, borderRadius: 12, backgroundColor: CORES.laranja, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  textoMarcaPagina: { color: CORES.texto, fontSize: 12, fontWeight: "700" },
  tituloSecao: { color: CORES.texto, fontSize: 16, fontWeight: "700" },
  cartaoContato: { minHeight: 96, borderWidth: 1, borderColor: CORES.borda, borderRadius: 16, backgroundColor: CORES.branco, flexDirection: "row", overflow: "hidden" },
  informacoesContato: { flex: 1, padding: 16, alignItems: "flex-start", gap: 7 },
  nomeContato: { color: CORES.texto, fontSize: 16, fontWeight: "700" },
  telefoneContato: { color: CORES.textoSecundario, fontSize: 14 },
  textoSelo: { color: CORES.roxo, fontSize: 11, fontWeight: "700" },
  acoesContato: { width: 76, alignItems: "center", justifyContent: "space-evenly", backgroundColor: CORES.roxoClaro },
  textoAcao: { color: CORES.roxo, fontSize: 13, fontWeight: "700" },
  textoExcluir: { color: CORES.vermelho, fontSize: 13, fontWeight: "700" },
  cartaoListaVazia: { padding: 18, borderWidth: 1, borderColor: CORES.borda, borderRadius: 16, backgroundColor: CORES.branco },
  listaVazia: { color: CORES.textoSecundario, fontSize: 14, textAlign: "center" },
  formulario: { padding: 16, borderWidth: 1, borderColor: CORES.borda, borderRadius: 16, backgroundColor: CORES.branco, gap: 12 },
  tituloFormulario: { color: CORES.texto, fontSize: 16, fontWeight: "700" },
  campo: { minHeight: 50, paddingHorizontal: 14, borderWidth: 1, borderColor: CORES.borda, borderRadius: 12, backgroundColor: CORES.branco, color: CORES.texto, fontSize: 14 },
  botaoSalvar: { minHeight: 48, borderRadius: 12, backgroundColor: CORES.roxo, alignItems: "center", justifyContent: "center" },
  textoBotaoSalvar: { color: CORES.branco, fontSize: 14, fontWeight: "700" },
  botaoCancelar: { minHeight: 42, alignItems: "center", justifyContent: "center" },
  botaoVoltar: { minHeight: 50, borderWidth: 1, borderColor: CORES.borda, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  erro: { color: CORES.vermelho, textAlign: "center" },
});
