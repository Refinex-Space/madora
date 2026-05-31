'use client';

import * as React from 'react';

interface WorkspaceAssetContextValue {
  mode: 'demo' | 'workspace';
  rootPath: string | null;
}

const WorkspaceAssetContext = React.createContext<WorkspaceAssetContextValue>({
  mode: 'demo',
  rootPath: null,
});

export function WorkspaceAssetProvider({
  children,
  mode,
  rootPath,
}: React.PropsWithChildren<WorkspaceAssetContextValue>) {
  return (
    <WorkspaceAssetContext.Provider value={{ mode, rootPath }}>
      {children}
    </WorkspaceAssetContext.Provider>
  );
}

export function useWorkspaceAssetContext() {
  return React.useContext(WorkspaceAssetContext);
}
