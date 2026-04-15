import { useEffect, useRef, useState } from "react";
import { DEFAULT_DOCUMENT_TITLE } from "../constants/appConfig";
import {
  getDocumentById,
  updateDocumentTitleById,
} from "../services/documentApi";

export const useDocumentTitleSync = (documentId: string, title: string) => {
  const [localTitle, setLocalTitle] = useState(DEFAULT_DOCUMENT_TITLE);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    setLocalTitle(title || DEFAULT_DOCUMENT_TITLE);
  }, [title]);

  useEffect(() => {
    if (!documentId) return;

    const fetchTitle = async () => {
      const doc = await getDocumentById(documentId);
      setLocalTitle(doc?.title || DEFAULT_DOCUMENT_TITLE);
      isFirstLoad.current = true;
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
      await updateDocumentTitleById(documentId, localTitle);
    }, 800);

    return () => clearTimeout(timeout);
  }, [documentId, localTitle]);

  return {
    localTitle,
    setLocalTitle,
  };
};
