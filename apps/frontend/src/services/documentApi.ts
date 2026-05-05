import {
  API_BASE_URL,
  DEFAULT_DOCUMENT_TITLE,
} from "../constants/appConfig";
import type { Doc } from "../types/document";


const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const getJsonHeaders = () => ({
  ...getAuthHeaders(),
  "Content-Type": "application/json",
});


const readJson = async (res: Response) => {
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  const payload = await res.json();
  return payload?.data ?? payload;
};


export const fetchWorkspaceDocuments = async (
  workspaceId: string,
  searchValue = ""
): Promise<Doc[]> => {
  const res = await fetch(
    `${API_BASE_URL}/document/workspaces/${workspaceId}/documents?search=${searchValue}`,
    {
      headers: getAuthHeaders(),
    }
  );

  const data = await readJson(res);
  return data?.items ?? [];
};


export const getDocumentById = async (
  documentId: string
): Promise<Doc | null> => {
  const res = await fetch(`${API_BASE_URL}/document/${documentId}`, {
    headers: getAuthHeaders(),
  });

  return (await readJson(res)) ?? null;
};


export const createWorkspaceDocument = async (
  workspaceId: string
): Promise<Doc | null> => {
  const res = await fetch(
    `${API_BASE_URL}/document/workspaces/${workspaceId}/documents`,
    {
      method: "POST",
      headers: getJsonHeaders(),
      body: JSON.stringify({
        title: DEFAULT_DOCUMENT_TITLE,
      }),
    }
  );

  const data = await readJson(res);

  if (!data?.id) return null;

  return {
    id: data.id,
    title: data.title,
  };
};


export const deleteDocumentById = async (
  documentId: string
): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/document/${documentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to delete document");
  }
};


export const updateDocumentTitleById = async (
  documentId: string,
  title: string
): Promise<void> => {
  const res = await fetch(
    `${API_BASE_URL}/document/${documentId}/title`,
    {
      method: "PATCH",
      headers: getJsonHeaders(),
      body: JSON.stringify({ title }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to update title");
  }
};