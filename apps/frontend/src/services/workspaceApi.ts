import { apiFetch } from "./client";

export async function getWorkspaces() {
  return apiFetch("/workspace");
}