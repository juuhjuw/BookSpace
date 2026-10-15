import React, { useState } from "react";
import {Alert,Pressable,ScrollView,StyleSheet,Text,View,} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { CORES } from "../../theme";

const PERGUNTAS = [
  "Ameaça com arma de fogo ou faca?",
  "Enforcamento ou estrangulamento?",
  "Agressões ficaram mais frequentes?",
];

const PONTUACAO_TOTAL = 26;
const PONTOS_POR_PERGUNTA = PONTUACAO_TOTAL / PERGUNTAS.length;

export default function Autoavaliacao({ navigation }) {
  const [marcadas, setMarcadas] = useState([true, true, false]);
  const quantidadeMarcadas = marcadas.filter(Boolean).length;
  const pontuacao = ((quantidadeMarcadas * PONTUACAO_TOTAL) /PERGUNTAS.length).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  const pontosPorPergunta = PONTOS_POR_PERGUNTA.toLocaleString("pt-BR", {maximumFractionDigits: 2,});
  const nivelRisco =quantidadeMarcadas === 0? "Baixo": quantidadeMarcadas === 1? "Moderado": "Alto";
  const orientacao =
    quantidadeMarcadas === 0? "Se precisar de orientação, ligue 180. Em perigo imediato, ligue 190."
      : quantidadeMarcadas === 1? "Procure apoio e orientação pelo 180. Em perigo imediato, ligue 190."
        : "Procure ajuda agora. Ligue 180 ou 190.";

  function alternarPergunta(index) {
    setMarcadas((atuais) =>
      atuais.map((valor, i) => (i === index ? !valor : valor)),
    );
  }

  function marcarPagina() {
    if (navigation.canGoBack()) {
      navigation.popToTop();
    }
  }

  function voltar() {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      Alert.alert("Voltar", "Não há uma tela anterior disponível.");
    }
  }

  return (
    <SafeAreaView style={styles.areaSegura}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cabecalho}>
          <View style={styles.blocoTitulo}>
            <Text accessibilityRole="header" style={styles.titulo}>
              Autoavaliação de Risco
            </Text>
            <Text style={styles.subtitulo}>
              Identifique sinais de risco e procure ajuda se precisar.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Marcar página"
            accessibilityHint="Retorna para a primeira tela do aplicativo"
            onPress={marcarPagina}
            hitSlop={8}
            style={({ pressed }) => [
              styles.botaoMarcaPagina,
              pressed && styles.pressionado,
            ]}
          >
            <Text style={styles.textoMarcaPagina}>Marcar-página</Text>
            <MaterialCommunityIcons
              name="location-exit"
              size={20}
              color={CORES.texto}
            />
          </Pressable>
        </View>

        <View style={styles.cartaoPerguntas}>
          <Text accessibilityRole="header" style={styles.tituloSecao}>
            Sinais de alerta
          </Text>
          <Text style={styles.instrucao}>
            Marque os sinais que já aconteceram.
          </Text>

          <View style={styles.listaPerguntas}>
            {PERGUNTAS.map((pergunta, index) => (
              <Pressable
                key={pergunta}
                style={({ pressed }) => [
                  styles.itemPergunta,
                  pressed && styles.pressionado,
                ]}
                onPress={() => alternarPergunta(index)}
                accessibilityRole="checkbox"
                accessibilityLabel={pergunta}
                accessibilityHint={`Vale ${pontosPorPergunta} pontos.`}
                accessibilityState={{ checked: marcadas[index] }}
              >
                <MaterialCommunityIcons
                  name={
                    marcadas[index]
                      ? "checkbox-marked"
                      : "checkbox-blank-outline"
                  }
                  size={22}
                  color={marcadas[index] ? CORES.roxo : CORES.textoSecundario}
                />
                <Text style={styles.textoPergunta}>{pergunta}</Text>
                <Text style={styles.pontosPergunta}>+{pontosPorPergunta}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View
          accessible
          accessibilityLabel={`Risco ${nivelRisco.toLowerCase()}. Pontuação ${pontuacao} de ${PONTUACAO_TOTAL}. ${orientacao}`}
          style={styles.cartaoResultado}
        >
          <View style={styles.linhaResultado}>
            <View
              style={[
                styles.seloRisco,
                nivelRisco === "Baixo" && styles.seloRiscoBaixo,
                nivelRisco === "Moderado" && styles.seloRiscoModerado,
              ]}
            >
              <Text
                style={[
                  styles.textoSelo,
                  nivelRisco === "Moderado" && styles.textoSeloModerado,
                ]}
              >
                Risco {nivelRisco.toLowerCase()}
              </Text>
            </View>
            <Text style={styles.pontuacao}>
              Pontuação {pontuacao}/{PONTUACAO_TOTAL}
            </Text>
          </View>

          <Text style={styles.orientacao}>{orientacao}</Text>
        </View>

        <View style={styles.espacador} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={voltar}
          style={({ pressed }) => [
            styles.botaoVoltar,
            pressed && styles.pressionado,
          ]}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={18}
            color={CORES.roxo}
          />
          <Text style={styles.textoBotaoVoltar}>Voltar</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  areaSegura: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },
  conteudo: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 18,
  },
  cabecalho: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  blocoTitulo: {
    flex: 1,
    gap: 6,
  },
  titulo: {
    color: CORES.roxo,
    fontSize: 24,
    fontWeight: "700",
  },
  subtitulo: {
    color: CORES.textoSecundario,
    fontSize: 13,
    lineHeight: 18,
  },
  botaoMarcaPagina: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: CORES.laranja,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  textoMarcaPagina: {
    color: CORES.texto,
    fontSize: 14,
    fontWeight: "700",
  },
  cartaoPerguntas: {
    padding: 16,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 16,
    backgroundColor: CORES.branco,
    gap: 12,
  },
  tituloSecao: {
    color: CORES.texto,
    fontSize: 16,
    fontWeight: "700",
  },
  instrucao: {
    color: CORES.textoSecundario,
    fontSize: 13,
    lineHeight: 18,
  },
  listaPerguntas: {
    gap: 4,
  },
  itemPergunta: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  textoPergunta: {
    flex: 1,
    color: CORES.texto,
    fontSize: 14,
    lineHeight: 20,
  },
  pontosPergunta: {
    color: CORES.textoSecundario,
    fontSize: 12,
    fontWeight: "600",
  },
  cartaoResultado: {
    padding: 16,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 16,
    backgroundColor: CORES.branco,
  },
  linhaResultado: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  seloRisco: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: CORES.vermelho,
  },
  seloRiscoBaixo: {
    backgroundColor: "#2E7D32",
  },
  seloRiscoModerado: {
    backgroundColor: CORES.laranja,
  },
  textoSelo: {
    color: CORES.branco,
    fontSize: 12,
    fontWeight: "700",
  },
  textoSeloModerado: {
    color: CORES.texto,
  },
  pontuacao: {
    color: CORES.textoSecundario,
    fontSize: 13,
  },
  orientacao: {
    color: CORES.texto,
    fontSize: 14,
    lineHeight: 20,
  },
  espacador: {
    flex: 1,
    minHeight: 4,
  },
  botaoVoltar: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  textoBotaoVoltar: {
    color: CORES.roxo,
    fontSize: 14,
    fontWeight: "700",
  },
  pressionado: {
    opacity: 0.75,
  },
});
