import { useCallback, useEffect, useRef, useState } from "react";

import { DEFAULT_DOCUMENT_TITLE } from "../constants/appConfig";

import { updateDocumentTitle } from "../services/documentApi";

export const useDocumentTitleSync = (documentId: string, title: string) => {
  const [localTitle, setLocalTitle] = useState(DEFAULT_DOCUMENT_TITLE);

  const isLocalEdit = useRef(false);

  useEffect(() => {
    const nextTitle = title || DEFAULT_DOCUMENT_TITLE;

    setLocalTitle((currentTitle) => {
      if (currentTitle === nextTitle) return currentTitle;

      isLocalEdit.current = false;
      return nextTitle;
    });
  }, [title]);

  useEffect(() => {
    isLocalEdit.current = false;
    setLocalTitle(title || DEFAULT_DOCUMENT_TITLE);
  }, [documentId]);

  const updateLocalTitle = useCallback((value: string) => {
    isLocalEdit.current = true;
    setLocalTitle(value);
  }, []);

  useEffect(() => {
    if (!documentId) return;

    if (!isLocalEdit.current) return;

    const nextTitle = localTitle.trim();

    if (!nextTitle) return;

    const timeout = setTimeout(async () => {
      try {
        await updateDocumentTitle(documentId, {
          title: nextTitle,
        });
      } catch (error) {
        console.error("Failed to update title", error);
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [documentId, localTitle]);

  return {
    localTitle,
    setLocalTitle: updateLocalTitle,
  };
};
