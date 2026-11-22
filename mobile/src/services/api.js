
import { Platform } from "react-native";
import { obterUsuarioAtual } from "./session";

const hostPadrao =
  Platform.OS === "android" ? "10.0.2.2" : "localhost";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || `http://${hostPadrao}:3000`;

export async function requisitar(caminho, opcoes = {}) {
  const { exigirToken = true, ...opcoesFetch } = opcoes;
  const sessao = exigirToken ? await obterUsuarioAtual() : null;
  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoesFetch,
    headers: {
      "Content-Type": "application/json",
      ...(sessao?.token ? { Authorization: `Bearer ${sessao.token}` } : {}),
      ...opcoesFetch.headers,
    },
  });

  if (resposta.status === 204) return null;

  const dados = await resposta.json();
  if (!resposta.ok) {
    throw new Error(dados.erro || `Erro na requisição (${resposta.status}).`);
  }
  return dados;
}
