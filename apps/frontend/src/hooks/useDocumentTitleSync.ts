import { useEffect, useRef, useState } from "react";

import { DEFAULT_DOCUMENT_TITLE } from "../constants/appConfig";

import { getDocument, updateDocumentTitle } from "../services/documentApi";

export const useDocumentTitleSync = (documentId: string, title: string) => {
  const [localTitle, setLocalTitle] = useState(DEFAULT_DOCUMENT_TITLE);

  const isFirstLoad = useRef(true);

  useEffect(() => {
    setLocalTitle(title || DEFAULT_DOCUMENT_TITLE);
  }, [title]);

  useEffect(() => {
    if (!documentId) return;

    const fetchTitle = async () => {
      try {
        const doc = await getDocument(documentId);

        setLocalTitle(doc?.data?.title || DEFAULT_DOCUMENT_TITLE);

        isFirstLoad.current = true;
      } catch (error) {
        console.error("Failed to fetch document title", error);
      }
    };

    fetchTitle();
  }, [documentId]);

  useEffect(() => {
    if (!documentId) return;

    if (!localTitle || localTitle.trim() === "") return;

    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        await updateDocumentTitle(documentId, {
          title: localTitle,
        });
      } catch (error) {
        console.error("Failed to update title", error);
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [documentId, localTitle]);

  return {
    localTitle,
    setLocalTitle,
  };
};
