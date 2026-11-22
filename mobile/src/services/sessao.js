import AsyncStorage from "@react-native-async-storage/async-storage";

const CHAVE_SESSAO = "@BookSpace:sessao";
const CHAVE_PERFIL = "@BookSpace: perfil";

export async function obterSessao() {
  const dados = await AsyncStorage.getItem(CHAVE_SESSAO);
  return dados ? JSON.parse(dados) : null;
}

export async function criarSessao(perfil) {
  await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(perfil));
  await AsyncStorage.setItem(
    CHAVE_PERFIL,
    JSON.stringify({
      nome: perfil.nome || "",
      email: perfil.email,
      pin: perfil.pin,
    })
  );
}

export async function encerrarSessao() {
  await AsyncStorage.removeItem(CHAVE_SESSAO);
}
