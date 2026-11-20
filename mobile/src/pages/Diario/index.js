import { CommonActions } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { CORES } from "../../theme";
import { requisitar } from "../../services/api";
import { obterUsuarioAtual } from "../../services/session";
import { estilo } from "./styles";

const CATEGORIAS = [
  "Violência Física",
  "Violência Psicológica",
  "Violência Moral",
  "Violência Patrimonial",
  "Violência Sexual",
  "Outros / Relato Geral",
];

function dataExibida(valor) {
  if (!valor) return "Data não informada";
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? "Data não informada" : data.toLocaleString("pt-BR");
}

export default function TelaDiario({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const [relatos, setRelatos] = useState([]);
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [idEditando, setIdEditando] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function carregarRelatos() {
    setCarregando(true);
    setErro("");
    try {
      const sessao = await obterUsuarioAtual();
      if (!sessao) throw new Error("Entre novamente para acessar seus registros.");
      setUsuario(sessao);
      setRelatos(await requisitar(`/diarios?user_id=${sessao.id}`));
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregarRelatos(); }, []);

  function marcarPagina() {
    navigation.dispatch(CommonActions.reset({
      index: 0,
      routes: [{ name: "Biblioteca" }],
    }));
  }

  function iniciarEdicao(item) {
    setIdEditando(item.id);
    setCategoria(item.titulo);
    setDescricao(item.descricao);
    setErro("");
  }

  function cancelarEdicao() {
    setIdEditando(null);
    setCategoria("");
    setDescricao("");
  }

  async function salvarRelato() {
    if (!usuario || salvando) return;
    if (!categoria || !descricao.trim()) {
      setErro("Escolha uma categoria e descreva o registro.");
      return;
    }

    setSalvando(true);
    setErro("");
    try {
      const corpo = JSON.stringify({
        user_id: usuario.id,
        titulo: categoria,
        descricao: descricao.trim(),
        data_ocorrencia: new Date().toISOString(),
      });
      await requisitar(
        idEditando === null ? "/diarios" : `/diarios/${idEditando}`,
        { method: idEditando === null ? "POST" : "PUT", body: corpo },
      );
      cancelarEdicao();
      await carregarRelatos();
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluirRelato(id) {
    try {
      await requisitar(`/diarios/${id}?user_id=${usuario.id}`, { method: "DELETE" });
      setRelatos((atuais) => atuais.filter((item) => item.id !== id));
      if (idEditando === id) cancelarEdicao();
    } catch (falha) {
      setErro(falha.message);
    }
  }

  function confirmarExclusao(id) {
    if (Platform.OS === "web") {
      if (window.confirm("Excluir este registro? Esta ação não pode ser desfeita.")) {
        excluirRelato(id);
      }
      return;
    }
    Alert.alert("Excluir ocorrência", "Esta ação não pode ser desfeita.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => excluirRelato(id) },
    ]);
  }

  return (
    <SafeAreaView style={estilo.container}>
      <ScrollView contentContainerStyle={estilo.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={estilo.header}>
          <Text style={estilo.tituloCabecalho}>Diário de Ocorrências</Text>
          <TouchableOpacity style={estilo.botaoMarcaPagina} onPress={marcarPagina}>
            <View style={estilo.corteMarcaPagina} />
          </TouchableOpacity>
        </View>

        <View style={estilo.cardFormulario}>
          <Text style={estilo.formTitulo}>{idEditando === null ? "Novo registro" : "Editar registro"}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {CATEGORIAS.map((item) => {
              const selecionado = categoria === item;
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setCategoria(item)}
                  style={{
                    backgroundColor: selecionado ? CORES.roxo : "#F0EEF5",
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: selecionado ? CORES.roxo : "#DCD6E4",
                  }}
                >
                  <Text style={{ color: selecionado ? "#FFF" : "#444", fontSize: 13, fontWeight: "600" }}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TextInput
            style={[estilo.input, estilo.textArea]}
            placeholder="O que aconteceu?"
            placeholderTextColor="#AFA8B2"
            multiline
            numberOfLines={4}
            value={descricao}
            onChangeText={setDescricao}
          />
          <TouchableOpacity style={estilo.botaoSalvar} onPress={salvarRelato} disabled={salvando}>
            <Text style={estilo.textoBotaoSalvar}>
              {salvando ? "Salvando..." : idEditando === null ? "Salvar registro" : "Salvar alterações"}
            </Text>
          </TouchableOpacity>
          {idEditando !== null && (
            <Pressable onPress={cancelarEdicao} style={estilo.botaoVoltar}>
              <Text style={estilo.textoVoltar}>Cancelar edição</Text>
            </Pressable>
          )}
        </View>

        {!!erro && <Text accessibilityRole="alert" style={estilo.textoVoltar}>{erro}</Text>}
        <View><Text style={estilo.subtitulo}>Histórico de Ocorrências</Text></View>
        {carregando && <Text>Carregando registros...</Text>}
        {!carregando && !erro && relatos.length === 0 && <Text>Nenhum registro cadastrado.</Text>}

        {relatos.map((item) => (
          <View key={item.id} style={estilo.card}>
            <View style={estilo.cardHeaderInfo}>
              <Text style={estilo.cardTitulo}>{item.titulo}</Text>
              <Text style={estilo.cardData}>{dataExibida(item.data_ocorrencia || item.criado_em)}</Text>
            </View>
            <Text style={estilo.cardDescricao}>{item.descricao}</Text>
            <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
              <Pressable onPress={() => iniciarEdicao(item)}>
                <Text style={estilo.textoVoltar}>Editar</Text>
              </Pressable>
              <Pressable onPress={() => confirmarExclusao(item.id)}>
                <Text style={{ color: CORES.vermelho }}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <TouchableOpacity style={estilo.botaoVoltar} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={CORES.roxo} />
          <Text style={estilo.textoVoltar}>Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
