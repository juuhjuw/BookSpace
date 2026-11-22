import {
  limparUsuarioAtual,
  obterUsuarioAtual,
  salvarUsuarioAtual,
} from "./session";

export async function obterSessao() {
  return obterUsuarioAtual();
}

export async function criarSessao(perfil) {
  const usuario =
    perfil?.usuario && typeof perfil.usuario === "object"
      ? perfil.usuario
      : perfil;
  await salvarUsuarioAtual({
    ...usuario,
    ...(perfil?.token ? { token: perfil.token } : {}),
  });
}

export async function encerrarSessao() {
  await limparUsuarioAtual();
}
