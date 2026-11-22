import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { CommonActions } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { CORES } from "../../theme";
import { requisitar } from "../../services/api";
import { obterUsuarioAtual } from "../../services/session";

const OPCOES = [
  {
    id: "diario",
    titulo: "Diário de Ocorrências",
    icone: "book-open-page-variant-outline",
    rota: "Diario",
  },
  {
    id: "rede",
    titulo: "Rede de Apoio",
    icone: "account-group-outline",
    rota: "RedeApoio",
  },
  {
    id: "risco",
    titulo: "Registro de Sinais",
    icone: "chart-box-outline",
    rota: "Autoavaliacao",
  },
  {
    id: "perfil",
    titulo: "Perfil e PIN",
    icone: "account-cog-outline",
    rota: "Perfil",
  },
];

// Componente responsável por representar um contato de emergência.
// Ele recebe o número, o nome do serviço e a cor de fundo.
function CartaoEmergencia({
  numero,
  servico,
  corFundo,
  corNumero = CORES.texto,
  onPress,
}) {
  return (
    // Pressable permite executar uma ação quando o usuário toca no cartão.
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ligar para ${servico}, número ${numero}`}
      accessibilityHint="Abre o aplicativo de telefone com o número preenchido"
      onPress={onPress}
      style={({ pressed }) => [
        styles.cartaoEmergencia,
        { backgroundColor: corFundo },
        pressed && styles.pressionado, // Altera estilo qunado apertado
      ]}
    >
      {/* Exibe o número do serviço de emergência */}
      <Text style={[styles.numeroEmergencia, { color: corNumero }]}>
        {numero}
      </Text>

      {/* Exibe o nome do serviço abaixo do número */}
      <Text style={styles.nomeEmergencia}>{servico}</Text>
    </Pressable>
  );
}

// Componente responsável por exibir cada opção do menu.
function ItemMenu({ titulo, icone, onPress }) {
  return (
    <Pressable
      accessible
      accessibilityRole="button"
      accessibilityLabel={titulo}
      onPress={onPress}
      style={({ pressed }) => [styles.itemMenu, pressed && styles.pressionado]}
    >
      {/* Ícone relacionado à opção apresentada. */}
      <MaterialCommunityIcons name={icone} size={18} color={CORES.branco} />

      {/* Nome da opção do menu. */}
      <Text style={styles.textoItemMenu}>{titulo}</Text>
    </Pressable>
  );
}

export default function AreaApoio({ navigation }) {
  const [resumo, setResumo] = useState(null);
  const [erroResumo, setErroResumo] = useState("");

  useEffect(() => {
    let ativo = true;
    async function carregarResumo() {
      try {
        const usuario = await obterUsuarioAtual();
        if (!usuario) throw new Error("Entre para consultar seus registros.");
        const [registros, contatos] = await Promise.all([
          requisitar(`/diarios?user_id=${usuario.id}`),
          requisitar(`/rede-apoio?user_id=${usuario.id}`),
        ]);
        if (ativo) setResumo({ registros: registros.length, contatos: contatos.length });
      } catch (erro) {
        if (ativo) setErroResumo(erro.message);
      }
    }
    carregarResumo();
    return () => { ativo = false; };
  }, []);

  async function ligar(numero) {
    const enderecoTelefone = `tel:${numero}`;
    try {
      const podeAbrir = await Linking.canOpenURL(enderecoTelefone);
      if (!podeAbrir) {
        Alert.alert(
          "Ligação indisponível",
          "Este aparelho não conseguiu abrir o telefone.",
        );
        return;
      }

      await Linking.openURL(enderecoTelefone);
    } catch (erro) {
      Alert.alert(
        "Não foi possível abrir o telefone",
        "Tente novamente ou digite o número manualmente.",
      );
    }
  }

  function sairRapido() {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Biblioteca" }],
      })
    );
  }

  function voltar() {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }
  return (
    <SafeAreaView style={styles.areaSegura}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>Área de apoio</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sair rapidamente"
            accessibilityHint="Retorna para a biblioteca"
            onPress={sairRapido}
            hitSlop={8}
            style={({ pressed }) => [
              styles.botaoSair,
              pressed && styles.pressionado,
            ]}
          >
            <Text style={styles.textoBotaoSair}>Marcar-página</Text>

            <MaterialCommunityIcons
              name="location-exit"
              size={20}
              color={CORES.texto}
            />
          </Pressable>
        </View>

        <View style={styles.linhaEmergencia}>
          <CartaoEmergencia
            numero="180"
            servico="Central da Mulher"
            corFundo={CORES.roxo}
            corNumero={CORES.branco}
            onPress={() => ligar("180")}
          />

          <CartaoEmergencia
            numero="190"
            servico="Polícia Militar"
            corFundo={CORES.laranja}
            onPress={() => ligar("190")}
          />
        </View>

        {/* Apresenta um resumo das informações registradas. */}
        <View
          accessible
          accessibilityLabel={resumo
            ? `Resumo: ${resumo.registros} registros e ${resumo.contatos} contatos`
            : "Resumo pessoal indisponível"}
          style={styles.cartaoResumo}
        >
          <Text style={styles.tituloResumo}>Seus registros</Text>

          <Text style={styles.textoResumo}>
            {resumo
              ? `${resumo.registros} registros · ${resumo.contatos} contatos`
              : erroResumo || "Carregando..."}
          </Text>
        </View>

        {/* Exibe todas as opções cadastradas na constante OPCOES. */}
        <View style={styles.listaOpcoes}>
          {OPCOES.map((opcao) => (
            // A propriedade key permite ao React identificar cada item da lista.
            <ItemMenu
              key={opcao.id}
              titulo={opcao.titulo}
              icone={opcao.icone}
              onPress={
                opcao.rota ? () => navigation.navigate(opcao.rota) : undefined
              }
            />
          ))}
        </View>

        {/* O espaçador empurra o botão Voltar para a parte inferior da tela. */}
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

// StyleSheet reúne todos os estilos utilizados pelos componentes da tela.
const styles = StyleSheet.create({
  // Ocupa todo o espaço disponível e define a cor de fundo.
  areaSegura: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },

  // Controla o espaçamento interno de todo o conteúdo rolável.
  conteudo: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },

  // Organiza o título e o botão de saída na mesma linha.
  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  titulo: {
    flex: 1,
    color: CORES.roxo,
    fontSize: 24,
    fontWeight: "700",
  },

  // Estilização do botão de saída rápida.
  botaoSair: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: CORES.laranja,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  textoBotaoSair: {
    color: CORES.texto,
    fontSize: 14,
    fontWeight: "700",
  },

  // Organiza os dois cartões de emergência lado a lado.
  linhaEmergencia: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },

  cartaoEmergencia: {
    flex: 1,
    minHeight: 82,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },

  numeroEmergencia: {
    fontSize: 26,
    fontWeight: "800",
  },

  nomeEmergencia: {
    color: CORES.texto,
    fontSize: 12,
    marginTop: 3,
  },

  // Estilização do cartão que apresenta o resumo.
  cartaoResumo: {
    marginTop: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 12,
    backgroundColor: CORES.branco,
  },

  tituloResumo: {
    color: CORES.texto,
    fontSize: 16,
    fontWeight: "700",
  },

  textoResumo: {
    color: CORES.textoSecundario,
    fontSize: 13,
    marginTop: 4,
  },

  // Define o espaço entre os itens do menu.
  listaOpcoes: {
    marginTop: 16,
    gap: 10,
  },

  itemMenu: {
    minHeight: 50,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: CORES.roxo,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  textoItemMenu: {
    flex: 1,
    color: CORES.branco,
    fontSize: 14,
    fontWeight: "500",
  },

  // Ocupa o espaço vertical restante antes do botão Voltar.
  espacador: {
    flexGrow: 1,
    minHeight: 28,
  },

  // Estilização do botão localizado no final da tela.
  botaoVoltar: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: CORES.fundo,
  },

  botaoVoltarDesabilitado: {
    opacity: 0.55,
  },

  textoBotaoVoltar: {
    color: CORES.roxo,
    fontSize: 14,
    fontWeight: "700",
  },

  // Fornece uma resposta visual durante o toque.
  pressionado: {
    opacity: 0.78,
  },
});
