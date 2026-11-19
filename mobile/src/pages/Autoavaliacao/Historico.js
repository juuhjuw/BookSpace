
import React, { useEffect, useState } from "react";
import {View,Text,ScrollView,Pressable,StyleSheet,} from "react-native";

import { CORES } from "../../theme";
import { API_URL } from "../../services/api";

export default function Historico({ navigation }) {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const userIdTeste = 1;

  async function carregarAvaliacoes() {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await fetch(
        `${API_URL}/autoavaliacoes?user_id=${userIdTeste}`
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Erro ao buscar avaliações.");
      }

      setAvaliacoes(dados);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  async function excluirAvaliacao(id) {
        try {
            const resposta = await fetch(
            `${API_URL}/autoavaliacoes/${id}?user_id=${userIdTeste}`,
            {
                method: "DELETE",
            }
            );

            if (!resposta.ok) {
            throw new Error("Não foi possível excluir a avaliação.");
            }

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
            Data: {new Date(
              avaliacao.data_avaliacao
            ).toLocaleDateString("pt-BR")}
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
});
