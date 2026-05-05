import { createContext, useContext, useEffect, useState } from "react";
import { getWorkspaces } from "../services/workspaceApi";

type Workspace = {
  id: string;
  name: string;
};

type WorkspaceContextType = {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  setCurrentWorkspaceId: (id: string) => void;
};

const WorkspaceContext = createContext<WorkspaceContextType>(null!);

export const WorkspaceProvider = ({ children }: any) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await getWorkspaces();

      const items = res?.data?.items || [];

      setWorkspaces(items);

      // AUTO SELECT FIRST WORKSPACE
      if (items.length > 0) {
        setCurrentWorkspaceId(items[0].id);
      }
    };

    load();
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{ workspaces, currentWorkspaceId, setCurrentWorkspaceId }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);