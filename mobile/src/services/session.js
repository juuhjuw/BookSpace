import AsyncStorage from "@react-native-async-storage/async-storage";

const CHAVE_USUARIO = "@BookSpace: usuario";
const CHAVE_PERFIL_ANTIGA = "@BookSpace: perfil";

export async function salvarUsuarioAtual(usuario) {
  await AsyncStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
  await AsyncStorage.removeItem(CHAVE_PERFIL_ANTIGA);
}

export async function obterUsuarioAtual() {
  const salvo = await AsyncStorage.getItem(CHAVE_USUARIO);
  if (!salvo) return null;

  const usuario = JSON.parse(salvo);
  return Number.isInteger(Number(usuario.id)) ? usuario : null;
}

export async function limparUsuarioAtual() {
  await AsyncStorage.removeItem(CHAVE_USUARIO);
  await AsyncStorage.removeItem(CHAVE_PERFIL_ANTIGA);
}
