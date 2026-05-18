import { apiClient } from "./client";

type CreateDocumentPayload = {
  title: string;
};

type UpdateTitlePayload = {
  title: string;
};

export async function getDocuments(workspaceId: string) {
  return apiClient(`/workspace/${workspaceId}/documents`);
}

export async function getDocument(documentId: string) {
  return apiClient(`/documents/${documentId}`);
}

export async function createDocument(
  workspaceId: string,
  data: CreateDocumentPayload,
) {
  return apiClient(`/workspace/${workspaceId}/documents`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateDocumentTitle(
  documentId: string,
  data: UpdateTitlePayload,
) {
  return apiClient(`/documents/${documentId}/title`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteDocument(documentId: string) {
  return apiClient(`/documents/${documentId}`, {
    method: "DELETE",
  });
}
