import { CommonActions } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { CORES } from "../../theme";
import { requisitar } from "../../services/api";
import { obterUsuarioAtual } from "../../services/session";

const PERGUNTAS = [
  "Ameaça com arma de fogo ou faca?",
  "Enforcamento ou estrangulamento?",
  "Agressões ficaram mais frequentes?",
];

export default function Autoavaliacao({ navigation, route }) {
  const [marcadas, setMarcadas] = useState([false, false, false]);
  const [usuario, setUsuario] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [contexto, setContexto] = useState(null);
  const [erroContexto, setErroContexto] = useState("");

  const avaliacaoEditando = route.params?.avaliacao || null;

  useEffect(() => {
    let ativo = true;
    async function carregarDados() {
      try {
        const sessao = await obterUsuarioAtual();
        if (!sessao) throw new Error("Entre novamente para salvar seus registros.");
        if (ativo) setUsuario(sessao);
      } catch (falha) {
        if (ativo) setErro(falha.message);
      }

      try {
        const dados = await requisitar("/modelo/contexto");
        if (ativo) setContexto(dados);
      } catch (falha) {
        if (ativo) setErroContexto(falha.message);
      }
    }
    carregarDados();
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    if (!avaliacaoEditando) {
      setMarcadas([false, false, false]);
      return;
    }
    const respostas = avaliacaoEditando.respostas || {};
    setMarcadas(PERGUNTAS.map((_, index) => respostas[`pergunta${index + 1}`] === true));
    setMensagem("");
    setErro("");
  }, [avaliacaoEditando]);

  function alternarPergunta(index) {
    setMarcadas((atuais) => atuais.map((valor, i) => (i === index ? !valor : valor)));
  }

  async function salvarAutoavaliacao() {
    if (!usuario || salvando) return;
    setSalvando(true);
    setMensagem("");
    setErro("");
    try {
      const respostas = Object.fromEntries(
        marcadas.map((marcada, index) => [`pergunta${index + 1}`, marcada]),
      );
      await requisitar(
        avaliacaoEditando
          ? `/autoavaliacoes/${avaliacaoEditando.id}`
          : "/autoavaliacoes",
        {
          method: avaliacaoEditando ? "PUT" : "POST",
          body: JSON.stringify({ user_id: usuario.id, respostas }),
        },
      );
      setMensagem(avaliacaoEditando ? "Registro atualizado." : "Registro salvo.");
      setMarcadas([false, false, false]);
      navigation.setParams({ avaliacao: null });
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setSalvando(false);
    }
  }

  function marcarPagina() {
    navigation.dispatch(CommonActions.reset({
      index: 0,
      routes: [{ name: "Biblioteca" }],
    }));
  }

  return (
    <SafeAreaView style={styles.areaSegura}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.cabecalho}>
          <View style={styles.blocoTitulo}>
            <Text accessibilityRole="header" style={styles.titulo}>Registro de sinais</Text>
            <Text style={styles.subtitulo}>
              Anote respostas para seu próprio acompanhamento. Este formulário não calcula nem classifica risco.
            </Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Sair rapidamente para a biblioteca" onPress={marcarPagina} style={styles.botaoMarcaPagina}>
            <Text style={styles.textoMarcaPagina}>Marcar-página</Text>
            <MaterialCommunityIcons name="location-exit" size={20} color={CORES.texto} />
          </Pressable>
        </View>

        <View style={styles.cartaoPerguntas}>
          <Text accessibilityRole="header" style={styles.tituloSecao}>
            {avaliacaoEditando ? "Editar respostas" : "Registro pessoal"}
          </Text>
          <Text style={styles.instrucao}>Marque os sinais que já aconteceram.</Text>
          <View style={styles.listaPerguntas}>
            {PERGUNTAS.map((pergunta, index) => (
              <Pressable
                key={pergunta}
                style={styles.itemPergunta}
                onPress={() => alternarPergunta(index)}
                accessibilityRole="checkbox"
                accessibilityLabel={pergunta}
                accessibilityState={{ checked: marcadas[index] }}
              >
                <MaterialCommunityIcons
                  name={marcadas[index] ? "checkbox-marked" : "checkbox-blank-outline"}
                  size={22}
                  color={marcadas[index] ? CORES.roxo : CORES.textoSecundario}
                />
                <Text style={styles.textoPergunta}>{pergunta}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.instrucao}>
            Em perigo imediato, ligue 190. Para orientação, ligue 180.
          </Text>
        </View>

        {!!erro && <Text accessibilityRole="alert" style={styles.erro}>{erro}</Text>}
        {!!mensagem && <Text style={styles.mensagem}>{mensagem}</Text>}
        <Pressable accessibilityRole="button" onPress={salvarAutoavaliacao} disabled={salvando} style={styles.botaoSalvar}>
          <Text style={styles.textoBotaoSalvar}>
            {salvando ? "Salvando..." : avaliacaoEditando ? "Salvar alterações" : "Salvar registro"}
          </Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate("Historico")} style={styles.botaoVoltar}>
          <Text style={styles.textoBotaoVoltar}>Ver registros salvos</Text>
        </Pressable>

        <View style={styles.cartaoPerguntas}>
          <Text style={styles.tituloSecao}>Contexto agregado do estudo acadêmico</Text>
          {contexto ? (
            <>
              <Text style={styles.instrucao}>
                {contexto.amostra.notificacoesComAlvoConhecido.toLocaleString("pt-BR")} notificações do SINAN 2024 com resposta conhecida; em {(
                  contexto.amostra.proporcaoComRecorrenciaRegistrada * 100
                ).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% já havia recorrência registrada.
              </Text>
              <Text style={styles.instrucao}>
                Modelo demonstrativo: F1 médio {contexto.validacao.f1Medio.toLocaleString("pt-BR", { style: "percent", maximumFractionDigits: 1 })};
                acurácia {contexto.validacao.acuraciaMedia.toLocaleString("pt-BR", { style: "percent", maximumFractionDigits: 1 })},
                abaixo do baseline de {contexto.validacao.baselineAcuracia.toLocaleString("pt-BR", { style: "percent", maximumFractionDigits: 1 })}.
              </Text>
              <Text style={styles.aviso}>{contexto.aviso}</Text>
            </>
          ) : (
            <Text style={styles.instrucao}>
              {erroContexto || "Carregando resultados agregados..."}
            </Text>
          )}
        </View>

        <Pressable onPress={() => navigation.goBack()} style={styles.botaoVoltar}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={CORES.roxo} />
          <Text style={styles.textoBotaoVoltar}>Voltar</Text>
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
  cartaoPerguntas: { padding: 16, borderWidth: 1, borderColor: CORES.borda, borderRadius: 16, backgroundColor: CORES.branco, gap: 12 },
  tituloSecao: { color: CORES.texto, fontSize: 16, fontWeight: "700" },
  instrucao: { color: CORES.textoSecundario, fontSize: 13, lineHeight: 19 },
  listaPerguntas: { gap: 4 },
  itemPergunta: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 12 },
  textoPergunta: { flex: 1, color: CORES.texto, fontSize: 14, lineHeight: 20 },
  aviso: { color: CORES.texto, fontSize: 12, lineHeight: 17, fontWeight: "600" },
  erro: { color: CORES.vermelho, textAlign: "center" },
  mensagem: { color: CORES.roxo, textAlign: "center" },
  botaoVoltar: { minHeight: 50, borderWidth: 1, borderColor: CORES.borda, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  textoBotaoVoltar: { color: CORES.roxo, fontSize: 14, fontWeight: "700" },
  botaoSalvar: { minHeight: 50, backgroundColor: CORES.roxo, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  textoBotaoSalvar: { color: CORES.branco, fontSize: 14, fontWeight: "700" },
});
