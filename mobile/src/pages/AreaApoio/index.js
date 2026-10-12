import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// tira o conteudo de tras do dinamique island
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

// Padronizacao de cor
const CORES = {
  fundo: "#FBF8F4",
  branco: "#FFFFFF",
  roxo: "#552066",
  roxoClaro: "#F1E6F4",
  laranja: "#F0A82F",
  texto: "#29232A",
  textoSecundario: "#746D78",
  borda: "#E4DDE6",
  itemDesabilitado: "#AFA8B2",
};

// Itens da lista da rede de apoio
const OPCOES = [
  {
    id: "diario",
    titulo: "Diário de Ocorrências",
    icone: "book-open-page-variant-outline",
  },
  {
    id: "rede",
    titulo: "Rede de Apoio",
    icone: "account-group-outline",
  },
  {
    id: "risco",
    titulo: "Autoavaliação de Risco",
    icone: "chart-box-outline",
  },
  {
    id: "perfil",
    titulo: "Perfil e PIN",
    icone: "account-cog-outline",
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
function ItemMenu({ titulo, icone }) {
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={titulo}
      style={styles.itemMenu}
    >
      {/* Ícone relacionado à opção apresentada. */}
      <MaterialCommunityIcons name={icone} size={18} color={CORES.branco} />

      {/* Nome da opção do menu. */}
      <Text style={styles.textoItemMenu}>{titulo}</Text>
    </View>
  );
}

export default function AreaApoio({ navigation }) {
  // Liga para o telefone do card
  async function ligar(numero) {
    const enderecoTelefone = `tel:${numero}`;
    try {
      const podeAbrir = await Linking.canOpenURL(enderecoTelefone);
      if (!podeAbrir) {
        Alert.alert(
          "Ligação indisponível",
          "Este aparelho não conseguiu abrir o telefone.",
        );
        return; // Faz a tentativa de ligar, se não, retorna o alerta
      }

      // Abre o aplicativo de telefone.
      // A ligação não é iniciada automaticamente.
      await Linking.openURL(enderecoTelefone);
    } catch (erro) {
      // Exibe uma mensagem caso ocorra algum problema inesperado.
      Alert.alert(
        "Não foi possível abrir o telefone",
        "Tente novamente ou digite o número manualmente.",
      );
    }
  }

  // Retorna para a primeira tela da pilha de navegação.
  function sairRapido() {
    if (navigation.canGoBack()) {
      navigation.popToTop();
    }
  }

  // Retorna apenas para a tela anterior caso exista
  function voltar() {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }
  const existeTelaAnterior = navigation.canGoBack(); // Verifica se existe tela anterior

  return (
    // Mantem o conteudo fora da ilha dinamica
    <SafeAreaView style={styles.areaSegura}>
      {/* Permite a rolagem quando o conteúdo não couber na altura da tela. */}
      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Agrupa o título e o botão de saída rápida. */}
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>Área de apoio</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sair rapidamente"
            accessibilityHint="Retorna para a primeira tela do aplicativo"
            accessibilityState={{ disabled: !existeTelaAnterior }}
            disabled={!existeTelaAnterior}
            onPress={sairRapido}
            hitSlop={8}
            style={({ pressed }) => [
              styles.botaoSair,
              !existeTelaAnterior && styles.botaoDesabilitado,
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

        {/* Agrupa os cartões dos serviços de emergência. */}
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
          accessibilityLabel="Resumo: zero registros, zero contatos e nenhum risco informado"
          style={styles.cartaoResumo}
        >
          <Text style={styles.tituloResumo}>Resumo</Text>

          <Text style={styles.textoResumo}>
            0 registros · 0 contatos · risco não informado
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
            />
          ))}
        </View>

        {/* O espaçador empurra o botão Voltar para a parte inferior da tela. */}
        <View style={styles.espacador} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          accessibilityState={{ disabled: !existeTelaAnterior }}
          disabled={!existeTelaAnterior}
          onPress={voltar}
          style={({ pressed }) => [
            styles.botaoVoltar,
            !existeTelaAnterior && styles.botaoVoltarDesabilitado,
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

  // Aplica transparência aos elementos desabilitados.
  botaoDesabilitado: {
    opacity: 0.55,
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
