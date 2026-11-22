
import { Platform } from "react-native";

const hostPadrao =
  Platform.OS === "android" ? "10.0.2.2" : "localhost";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || `http://${hostPadrao}:3000`;

async function request(caminho, options = {}) {
  const response = await fetch(`${API_URL}${caminho}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (response.status === 204) return null;

  let dados = null;
  try {
    dados = await response.json();
  } catch {
    dados = null;
  }

  if (!response.ok) {
    throw new Error(dados?.erro || `Erro HTTP ${response.status}`);
  }
  return dados;
}

const api = {
  get: (caminho) => request(caminho),
  post: (caminho, corpo) =>
    request(caminho, { method: "POST", body: JSON.stringify(corpo) }),
  put: (caminho, corpo) =>
    request(caminho, { method: "PUT", body: JSON.stringify(corpo) }),
  delete: (caminho) =>
    request(caminho, { method: "DELETE" }),
};

export default api;
