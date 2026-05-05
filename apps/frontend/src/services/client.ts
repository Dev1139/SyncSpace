import { API_BASE_URL } from "../constants/appConfig";

export async function apiFetch(
  url: string,
  options: RequestInit = {},
) {
  const token = localStorage.getItem("token");
  
  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {}),
    },
  }).then((res) => res.json());
}