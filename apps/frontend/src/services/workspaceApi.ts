import { apiClient } from "./client";

export async function getWorkspaces() {
  return apiClient("/workspace");
}