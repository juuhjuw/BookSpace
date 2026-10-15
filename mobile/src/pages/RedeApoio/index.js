import { useRef, useState } from "react";
import {
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

// Contatos para simular um banco e api
const CONTATOS_INICIAIS = [
  {
    id: "1",
    nome: "Maria Silva",
    telefone: "(11) 99995-4321",
    vinculo: "Irmã",
  },
  {
    id: "2",
    nome: "João Souza",
    telefone: "(11) 91234-5678",
    vinculo: "Amigo",
  },
];

// montagem do componente
export default function RedeApoio({ navigation }) {
  const [contatos, setContatos] = useState(CONTATOS_INICIAIS);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const telefoneRef = useRef(null);

  // cria um contato
  function salvarContato() {
    const novoContato = {
      id: String(Date.now()),
      nome,
      telefone,
      vinculo: "Contato",
    };

    // apenda o novo contato
    setContatos((contatosAtuais) => [...contatosAtuais, novoContato]);

    // Limpa os campos depois do cadastro.
    setNome("");
    setTelefone("");
  }

  // Exclui da lista o contato selecionado.
  function excluirContato(id) {
    setContatos((contatosAtuais) =>
      contatosAtuais.filter((contato) => contato.id !== id),
    );
  }

  function marcarPagina() {
    navigation.popToTop();
  }

  // Retorna para a tela anterior.
  function voltar() {
    navigation.goBack();
  }

  return (
    // Mantém o conteúdo dentro da área segura do aparelho.
    <SafeAreaView style={styles.areaSegura}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Área do cabeçalho. */}
        <View style={styles.cabecalho}>
          <View style={styles.blocoTitulo}>
            <Text accessibilityRole="header" style={styles.titulo}>
              Rede de Apoio
            </Text>

            <Text style={styles.subtitulo}>
              Na fachada, é exibido como “Contatos Frequentes”.
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
        <Text accessibilityRole="header" style={styles.tituloSecao}>
          Contatos de Confiança
        </Text>
        <View style={styles.listaContatos}>
          {contatos.length === 0 ? (
            <View style={styles.cartaoListaVazia}>
              <Text style={styles.listaVazia}>
                Nenhum contato de confiança cadastrado.
              </Text>
            </View>
          ) : (
            // Lista os contatos
            contatos.map((contato) => (
              <View key={contato.id} style={styles.cartaoContato}>
                <View style={styles.informacoesContato}>
                  <Text style={styles.nomeContato}>{contato.nome}</Text>

                  <Text selectable style={styles.telefoneContato}>
                    {contato.telefone}
                  </Text>
                  <View style={styles.seloContato}>
                    <Text style={styles.textoSelo}>
                      {contato.vinculo} · Alerta ativo
                    </Text>
                  </View>
                </View>

                {/* remove contato */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Excluir contato ${contato.nome}`}
                  accessibilityHint="Remove este contato da rede de apoio"
                  onPress={() => excluirContato(contato.id)}
                  style={({ pressed }) => [
                    styles.botaoExcluir,
                    pressed && styles.pressionado,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={19}
                    color={CORES.vermelho}
                  />

                  <Text style={styles.textoExcluir}>Excluir</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
        {/* cadastro de contato */}
        <View style={styles.formulario}>
          <Text accessibilityRole="header" style={styles.tituloFormulario}>
            Novo contato de confiança
          </Text>
          <TextInput
            accessibilityLabel="Nome ou apelido do contato"
            placeholder="Nome ou Apelido"
            placeholderTextColor={CORES.itemDesabilitado}
            value={nome}
            onChangeText={setNome}
            returnKeyType="next"
            onSubmitEditing={() => telefoneRef.current?.focus()}
            style={styles.campo}
          />
          <TextInput
            ref={telefoneRef}
            accessibilityLabel="Telefone com DDD"
            placeholder="Telefone com DDD"
            placeholderTextColor={CORES.itemDesabilitado}
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
            returnKeyType="done"
            onSubmitEditing={salvarContato}
            style={styles.campo}
          />

          {/*adiciona contato temporario */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Salvar contato"
            onPress={salvarContato}
            style={({ pressed }) => [
              styles.botaoSalvar,
              pressed && styles.pressionado,
            ]}
          >
            <Text style={styles.textoBotaoSalvar}>Salvar Contato</Text>
          </Pressable>
        </View>
        <View style={styles.espacador} />{" "}
        {/* separa o conteudo do botao voltar*/}
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

  tituloSecao: {
    color: CORES.texto,
    fontSize: 16,
    fontWeight: "700",
  },

  listaContatos: {
    gap: 12,
  },

  cartaoContato: {
    minHeight: 104,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 16,
    backgroundColor: CORES.branco,
    flexDirection: "row",
    overflow: "hidden",
  },

  informacoesContato: {
    flex: 1,
    padding: 16,
    alignItems: "flex-start",
    gap: 7,
  },

  nomeContato: {
    color: CORES.texto,
    fontSize: 16,
    fontWeight: "700",
  },

  telefoneContato: {
    color: CORES.textoSecundario,
    fontSize: 14,
  },
  seloContato: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: CORES.roxoClaro,
  },

  textoSelo: {
    color: CORES.roxo,
    fontSize: 11,
    fontWeight: "700",
  },

  botaoExcluir: {
    width: 82,
    minHeight: 48,
    paddingHorizontal: 8,
    backgroundColor: CORES.vermelhoClaro,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  textoExcluir: {
    color: CORES.vermelho,
    fontSize: 12,
    fontWeight: "700",
  },

  cartaoListaVazia: {
    padding: 18,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 16,
    backgroundColor: CORES.branco,
  },

  listaVazia: {
    color: CORES.textoSecundario,
    fontSize: 14,
    textAlign: "center",
  },

  formulario: {
    padding: 16,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 16,
    backgroundColor: CORES.branco,
    gap: 12,
  },

  tituloFormulario: {
    color: CORES.texto,
    fontSize: 16,
    fontWeight: "700",
  },

  campo: {
    minHeight: 50,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 12,
    backgroundColor: CORES.branco,
    color: CORES.texto,
    fontSize: 14,
  },

  botaoSalvar: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: CORES.roxo,
    alignItems: "center",
    justifyContent: "center",
  },
  textoBotaoSalvar: {
    color: CORES.branco,
    fontSize: 14,
    fontWeight: "700",
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
