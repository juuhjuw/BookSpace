import { CommonActions } from "@react-navigation/native";

import React, { useEffect, useState } from "react";
import {View,Text,ScrollView,Pressable,StyleSheet,} from "react-native";

import { CORES } from "../../theme";
import api from "../../services/api";
import { obterSessao } from "../../services/sessao";

export default function Historico({ navigation }) {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // READ: histórico da usuária logada (GET /autoavaliacoes?user_id=)
  async function carregarAvaliacoes() {
    setCarregando(true);
    setErro("");

    try {
      const sessao = await obterSessao();
      if (!sessao) throw new Error("Faça login novamente para ver o histórico.");
      setAvaliacoes(await api.get(`/autoavaliacoes?user_id=${sessao.id}`));
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  // DELETE /autoavaliacoes/:id
  async function excluirAvaliacao(id) {
    try {
      const sessao = await obterSessao();
      await api.delete(`/autoavaliacoes/${id}?user_id=${sessao?.id ?? ""}`);
      await carregarAvaliacoes();
    } catch (erro) {
      setErro(erro.message);
    }
  }

  useEffect(() => {
    carregarAvaliacoes();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Saída rápida: volta para a fachada (Biblioteca) */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Marcar página"
        onPress={() => navigation.dispatch(
          CommonActions.reset({ index: 0, routes: [{ name: "Biblioteca" }] })
        )}
        style={styles.botaoMarcaPagina}
      >
        <Text style={styles.textoMarcaPagina}>Marcar-página</Text>
      </Pressable>

      <Text style={styles.titulo}>
        Histórico de autoavaliações
      </Text>

      <Pressable
        style={styles.botaoAtualizar}
        onPress={carregarAvaliacoes}
      >
        <Text style={styles.textoBotao}>Atualizar histórico</Text>
      </Pressable>

      {carregando && <Text>Carregando...</Text>}

      {!!erro && <Text style={styles.erro}>{erro}</Text>}

      {!carregando && !erro && avaliacoes.length === 0 && (
        <Text>Nenhuma autoavaliação encontrada.</Text>
      )}

      {avaliacoes.map((avaliacao) => (
        <View key={avaliacao.id} style={styles.cartao}>
          <Text style={styles.nome}>
            Avaliação #{avaliacao.id}
          </Text>

          <Text>
            Pontuação: {avaliacao.pontuacao_total}/26
          </Text>

          <Text>
            Nível: {avaliacao.nivel_risco}
          </Text>

          <Text>
            Data: {String(avaliacao.data_avaliacao).slice(0, 10).split("-").reverse().join("/")}
          </Text>

          <Pressable
            style={styles.botaoExcluir}
            onPress={() => excluirAvaliacao(avaliacao.id)}
          >
            <Text style={styles.textoExcluir}>Excluir avaliação</Text>
          </Pressable>
        </View>
      ))}

      <Pressable
        style={styles.botaoVoltar}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.textoVoltar}>Voltar</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.fundo,
    padding: 20,
  },
  titulo: {
    color: CORES.roxo,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  botaoAtualizar: {
    backgroundColor: CORES.roxo,
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  textoBotao: {
    color: CORES.branco,
    fontWeight: "700",
  },
  cartao: {
    backgroundColor: CORES.branco,
    borderColor: CORES.borda,
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  nome: {
    fontSize: 16,
    fontWeight: "700",
    color: CORES.roxo,
  },
  erro: {
    color: CORES.vermelho,
    marginBottom: 12,
  },
  botaoVoltar: {
    padding: 14,
    alignItems: "center",
  },
  textoVoltar: {
    color: CORES.roxo,
    fontWeight: "700",
  },
  botaoExcluir: {
    backgroundColor: CORES.vermelho,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
    textoExcluir: {
    color: CORES.branco,
    fontWeight: "700",
  },
  botaoMarcaPagina: {
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: CORES.laranja,
    marginTop: 8,
  },
  textoMarcaPagina: {
    color: CORES.texto,
    fontWeight: "700",
    fontSize: 12,
  },
});
