import { CommonActions } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import api from "../../services/api";
import { obterSessao } from "../../services/sessao";

// CRUD Rede de Apoio - agora os contatos vêm da API
export default function RedeApoio({ navigation }) {
  const [usuaria, setUsuaria] = useState(null);
  const [contatos, setContatos] = useState([]);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [vinculo, setVinculo] = useState("");
  const [idEditando, setIdEditando] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const telefoneRef = useRef(null);
  const vinculoRef = useRef(null);

  // READ: busca os contatos da usuária logada
  const carregarContatos = useCallback(async (user) => {
    setCarregando(true);
    setErro("");
    try {
      setContatos(await api.get(`/rede-apoio?user_id=${user.id}`));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const sessao = await obterSessao();
      if (!sessao) {
        setCarregando(false);
        setErro("Faça login novamente para ver seus contatos.");
        return;
      }
      setUsuaria(sessao);
      carregarContatos(sessao);
    })();
  }, [carregarContatos]);

  function limparFormulario() {
    setNome("");
    setTelefone("");
    setVinculo("");
    setIdEditando(null);
  }

  // CREATE / UPDATE
  async function salvarContato() {
    if (!usuaria || salvando) return;
    if (!nome.trim() || !telefone.trim()) {
      Alert.alert("Atenção", "Preencha o nome e o telefone do contato.");
      return;
    }
    setSalvando(true);
    try {
      const corpo = { nome_contato: nome, telefone, vinculo: vinculo || "Contato" };
      if (idEditando !== null) {
        await api.put(`/rede-apoio/${idEditando}?user_id=${usuaria.id}`, corpo);
      } else {
        await api.post("/rede-apoio", { ...corpo, user_id: usuaria.id });
      }
      limparFormulario();
      await carregarContatos(usuaria);
    } catch (e) {
      Alert.alert("Não foi possível salvar", e.message);
    } finally {
      setSalvando(false);
    }
  }

  function iniciarEdicao(contato) {
    setIdEditando(contato.id);
    setNome(contato.nome_contato);
    setTelefone(contato.telefone);
    setVinculo(contato.vinculo === "Contato" ? "" : contato.vinculo);
  }

  // DELETE
  async function excluirContato(id) {
    const executar = async () => {
      try {
        await api.delete(`/rede-apoio/${id}?user_id=${usuaria.id}`);
        if (idEditando === id) limparFormulario();
        await carregarContatos(usuaria);
      } catch (e) {
        Alert.alert("Não foi possível excluir", e.message);
      }
    };
    if (Platform.OS === "web") {
      if (window.confirm("Excluir este contato?")) executar();
      return;
    }
    Alert.alert("Excluir contato", "Tem certeza que deseja excluir este contato?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: executar },
    ]);
  }

  // marca-página: volta pra biblioteca
  function marcarPagina() {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Biblioteca" }],
      })
    );
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
            accessibilityHint="Retorna para a Biblioteca"
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
          {carregando ? (
            <ActivityIndicator color={CORES.roxo} />
          ) : erro !== "" ? (
            <View style={styles.cartaoListaVazia}>
              <Text style={[styles.listaVazia, { color: CORES.vermelho }]}>{erro}</Text>
              {usuaria && (
                <Pressable onPress={() => carregarContatos(usuaria)}>
                  <Text style={styles.textoTentar}>Tentar novamente</Text>
                </Pressable>
              )}
            </View>
          ) : contatos.length === 0 ? (
            <View style={styles.cartaoListaVazia}>
              <Text style={styles.listaVazia}>
                Nenhum contato de confiança cadastrado.
              </Text>
            </View>
          ) : (
            // Lista os contatos vindos da API
            contatos.map((contato) => (
              <View key={contato.id} style={styles.cartaoContato}>
                <View style={styles.informacoesContato}>
                  <Text style={styles.nomeContato}>{contato.nome_contato}</Text>

                  <Text selectable style={styles.telefoneContato}>
                    {contato.telefone}
                  </Text>
                  <View style={styles.seloContato}>
                    <Text style={styles.textoSelo}>
                      {contato.vinculo} · Alerta ativo
                    </Text>
                  </View>
                </View>

                {/* edita contato */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Editar contato ${contato.nome_contato}`}
                  onPress={() => iniciarEdicao(contato)}
                  style={({ pressed }) => [
                    styles.botaoEditar,
                    pressed && styles.pressionado,
                  ]}
                >
                  <MaterialCommunityIcons name="pencil-outline" size={19} color={CORES.roxo} />
                  <Text style={styles.textoEditar}>Editar</Text>
                </Pressable>

                {/* remove contato */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Excluir contato ${contato.nome_contato}`}
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
        {/* cadastro / edição de contato */}
        <View style={styles.formulario}>
          <Text accessibilityRole="header" style={styles.tituloFormulario}>
            {idEditando !== null ? "Editar contato" : "Novo contato de confiança"}
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
            returnKeyType="next"
            onSubmitEditing={() => vinculoRef.current?.focus()}
            style={styles.campo}
          />
          <TextInput
            ref={vinculoRef}
            accessibilityLabel="Vínculo com o contato"
            placeholder="Vínculo (ex.: Irmã, Amiga) — opcional"
            placeholderTextColor={CORES.itemDesabilitado}
            value={vinculo}
            onChangeText={setVinculo}
            returnKeyType="done"
            onSubmitEditing={salvarContato}
            style={styles.campo}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Salvar contato"
            onPress={salvarContato}
            disabled={salvando}
            style={({ pressed }) => [
              styles.botaoSalvar,
              pressed && styles.pressionado,
            ]}
          >
            <Text style={styles.textoBotaoSalvar}>
              {salvando ? "Salvando..." : idEditando !== null ? "Salvar alterações" : "Salvar Contato"}
            </Text>
          </Pressable>

          {idEditando !== null && (
            <Pressable onPress={limparFormulario} style={styles.botaoVoltar}>
              <Text style={styles.textoBotaoVoltar}>Cancelar edição</Text>
            </Pressable>
          )}
        </View>
        {/* separa o conteudo do botao voltar*/}
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
  botaoEditar: {
    width: 72,
    minHeight: 48,
    paddingHorizontal: 8,
    backgroundColor: CORES.roxoClaro,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  textoEditar: {
    color: CORES.roxo,
    fontSize: 12,
    fontWeight: "700",
  },
  textoTentar: {
    color: CORES.roxo,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 8,
  },
});
