import { apiClient } from "./client";

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export async function login(data: LoginPayload) {
  return apiClient("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function register(data: RegisterPayload) {
  return apiClient("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMe() {
  return apiClient("/auth/me");
}
