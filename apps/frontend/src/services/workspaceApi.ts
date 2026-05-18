import { apiClient } from "./client";

type CreateWorkspacePayload = {
  name: string;
};

type UpdateWorkspacePayload = {
  name: string;
};

export async function getWorkspaces() {
  return apiClient("/workspace");
}

export async function getWorkspace(workspaceId: string) {
  return apiClient(`/workspace/${workspaceId}`);
}

export async function createWorkspace(data: CreateWorkspacePayload) {
  return apiClient("/workspace", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateWorkspace(
  workspaceId: string,
  data: UpdateWorkspacePayload,
) {
  return apiClient(`/workspace/${workspaceId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteWorkspace(workspaceId: string) {
  return apiClient(`/workspace/${workspaceId}`, {
    method: "DELETE",
  });
}

export async function getWorkspaceMembers(workspaceId: string) {
  return apiClient(`/workspace/${workspaceId}/members`);
}

export async function inviteMember(
  workspaceId: string,
  data: {
    email: string;
    role: "editor" | "viewer";
  },
) {
  return apiClient(`/workspace/${workspaceId}/invite`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
