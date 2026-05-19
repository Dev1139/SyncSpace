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

type UpdateProfilePayload = {
  name: string;
};

type UpdatePasswordPayload = {
  oldPassword: string;
  newPassword: string;
};

export async function updateProfile(data: UpdateProfilePayload) {
  return apiClient("/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function updatePassword(data: UpdatePasswordPayload) {
  return apiClient("/auth/password", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

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
