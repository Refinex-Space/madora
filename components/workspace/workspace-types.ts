export type WorkspaceNodeKind = 'directory' | 'document';

export interface WorkspaceNode {
  id: string;
  name: string;
  kind: WorkspaceNodeKind;
  relativePath: string;
  absolutePath: string;
  title?: string;
  children?: WorkspaceNode[];
}

export interface WorkspaceSnapshot {
  rootPath: string;
  rootName: string;
  nodes: WorkspaceNode[];
}

export interface WorkspaceHistoryItem {
  rootPath: string;
  rootName: string;
  lastOpenedAt: number;
}

export interface WorkspaceSearchResult {
  id: string;
  name: string;
  title: string;
  relativePath: string;
  absolutePath: string;
}

export interface WorkspaceLoadError {
  message: string;
  recoverable: boolean;
}

export interface DocumentContent {
  path: string;
  content: string;
  modifiedAt: number;
}

export interface DocumentContentMeta {
  path: string;
  modifiedAt: number;
}

export type DocumentLoadState = 'idle' | 'loading' | 'loaded' | 'error';

export type DocumentSaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';
