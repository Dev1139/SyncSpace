import {
  API_BASE_URL,
  AUTH_TOKEN,
  DEFAULT_DOCUMENT_TITLE,
  WORKSPACE_ID,
} from "../constants/appConfig";
import type { Doc } from "../types/document";

const authHeaders = {
  Authorization: AUTH_TOKEN,
};

const jsonHeaders = {
  ...authHeaders,
  "Content-Type": "application/json",
};

const readJson = async (res: Response) => {
  const payload = await res.json();
  return payload?.data ?? payload;
};

export const fetchWorkspaceDocuments = async (
  searchValue = "",
): Promise<Doc[]> => {
  const res = await fetch(
    `${API_BASE_URL}/document/workspaces/${WORKSPACE_ID}/documents?search=${searchValue}`,
    { headers: authHeaders },
  );
  const data = await readJson(res);
  return data?.items ?? [];
};

export const getDocumentById = async (documentId: string): Promise<Doc | null> => {
  const res = await fetch(`${API_BASE_URL}/document/${documentId}`, {
    headers: authHeaders,
  });
  return (await readJson(res)) ?? null;
};

export const createWorkspaceDocument = async (): Promise<Doc | null> => {
  const res = await fetch(
    `${API_BASE_URL}/document/workspaces/${WORKSPACE_ID}/documents`,
    {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ title: DEFAULT_DOCUMENT_TITLE }),
    },
  );

  const data = await readJson(res);
  if (!data?.id) return null;

  return {
    id: data.id,
    title: data.title,
  };
};

export const deleteDocumentById = async (documentId: string): Promise<void> => {
  await fetch(`${API_BASE_URL}/document/${documentId}`, {
    method: "DELETE",
    headers: authHeaders,
  });
};

export const updateDocumentTitleById = async (
  documentId: string,
  title: string,
): Promise<void> => {
  await fetch(`${API_BASE_URL}/document/${documentId}/title`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify({ title }),
  });
};
