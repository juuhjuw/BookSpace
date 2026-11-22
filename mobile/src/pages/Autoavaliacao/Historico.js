import { CommonActions } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CORES } from "../../theme";
import { requisitar } from "../../services/api";
import { obterUsuarioAtual } from "../../services/session";

const PERGUNTAS = [
  "Ameaça com arma de fogo ou faca?",
  "Enforcamento ou estrangulamento?",
  "Agressões ficaram mais frequentes?",
];

export default function Historico({ navigation }) {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [userId, setUserId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarAvaliacoes() {
    setCarregando(true);
    setErro("");
    try {
      const sessao = await obterUsuarioAtual();
      if (!sessao) throw new Error("Entre novamente para acessar seus registros.");
      setUserId(sessao.id);
      setAvaliacoes(await requisitar(`/autoavaliacoes?user_id=${sessao.id}`));
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregarAvaliacoes(); }, []);

  function marcarPagina() {
    navigation.dispatch(CommonActions.reset({
      index: 0,
      routes: [{ name: "Biblioteca" }],
    }));
  }

  async function excluirAvaliacao(id) {
    try {
      await requisitar(`/autoavaliacoes/${id}?user_id=${userId}`, { method: "DELETE" });
      setAvaliacoes((atuais) => atuais.filter((item) => item.id !== id));
    } catch (falha) {
      setErro(falha.message);
    }
  }

  function confirmarExclusao(id) {
    if (Platform.OS === "web") {
      if (window.confirm("Excluir este registro?")) excluirAvaliacao(id);
      return;
    }
    Alert.alert("Excluir registro", "Deseja excluir este item?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => excluirAvaliacao(id) },
    ]);
  }

  function resumoRespostas(respostas) {
    if (!respostas) return "Respostas indisponíveis.";
    const marcadas = PERGUNTAS.filter((_, indice) => respostas[`pergunta${indice + 1}`]);
    return marcadas.length
      ? marcadas.join(" · ")
      : "Nenhum sinal foi marcado neste registro.";
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Registros salvos</Text>
      <Text style={styles.subtitulo}>
        Suas respostas pessoais não são convertidas em pontuação ou classificação de risco.
      </Text>

      <Pressable style={styles.botaoMarcaPagina} onPress={marcarPagina} accessibilityRole="button">
        <Text style={styles.textoMarcaPagina}>Marcar-página · Biblioteca</Text>
      </Pressable>
      <Pressable style={styles.botaoAtualizar} onPress={carregarAvaliacoes} disabled={carregando}>
        <Text style={styles.textoBotao}>{carregando ? "Carregando..." : "Atualizar registros"}</Text>
      </Pressable>

      {!!erro && <Text accessibilityRole="alert" style={styles.erro}>{erro}</Text>}
      {!carregando && !erro && avaliacoes.length === 0 && (
        <Text style={styles.subtitulo}>Nenhum registro salvo.</Text>
      )}
      {avaliacoes.map((avaliacao) => (
        <View key={avaliacao.id} style={styles.cartao}>
          <Text style={styles.nome}>
            Registro #{avaliacao.id} · {new Date(avaliacao.data_avaliacao).toLocaleDateString("pt-BR")}
          </Text>
          <Text style={styles.respostas}>{resumoRespostas(avaliacao.respostas)}</Text>
          <View style={styles.acoes}>
            <Pressable
              onPress={() => navigation.navigate("Autoavaliacao", { avaliacao })}
              accessibilityRole="button"
            >
              <Text style={styles.textoAcao}>Editar</Text>
            </Pressable>
            <Pressable onPress={() => confirmarExclusao(avaliacao.id)} accessibilityRole="button">
              <Text style={styles.textoExcluir}>Excluir</Text>
            </Pressable>
          </View>
        </View>
      ))}
      <Pressable style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
        <Text style={styles.textoAcao}>Voltar</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: CORES.fundo, padding: 20, gap: 14 },
  titulo: { color: CORES.roxo, fontSize: 22, fontWeight: "700" },
  subtitulo: { color: CORES.textoSecundario, fontSize: 13, lineHeight: 19 },
  botaoAtualizar: { backgroundColor: CORES.roxo, padding: 14, borderRadius: 10, alignItems: "center" },
  textoBotao: { color: CORES.branco, fontWeight: "700" },
  cartao: { backgroundColor: CORES.branco, borderColor: CORES.borda, borderWidth: 1, padding: 16, borderRadius: 12, gap: 8 },
  nome: { fontSize: 16, fontWeight: "700", color: CORES.roxo },
  respostas: { color: CORES.texto, fontSize: 14, lineHeight: 20 },
  erro: { color: CORES.vermelho },
  acoes: { flexDirection: "row", gap: 20, marginTop: 6 },
  textoAcao: { color: CORES.roxo, fontWeight: "700" },
  textoExcluir: { color: CORES.vermelho, fontWeight: "700" },
  botaoVoltar: { padding: 14, alignItems: "center" },
  botaoMarcaPagina: { backgroundColor: CORES.laranja, padding: 14, borderRadius: 10, alignItems: "center" },
  textoMarcaPagina: { color: CORES.texto, fontWeight: "700" },
});
