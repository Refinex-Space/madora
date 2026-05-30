'use client';

import * as React from 'react';
import {
  FileInput,
  FilePlus2,
  Folder,
  FolderOpen,
  FolderPlus,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import { filterWorkspaceNodes } from './workspace-tree';
import type { WorkspaceNode } from './workspace-types';

interface DocumentTreeProps {
  nodes: WorkspaceNode[];
  searchQuery: string;
  currentDocumentPath: string | null;
  onCreateDirectory: (parentPath: string) => void;
  onCreateDocument: (parentPath: string) => void;
  onImportMarkdown: (targetDir: string) => void;
  onSelectDocument: (node: WorkspaceNode) => void;
}

export function DocumentTree({
  nodes,
  searchQuery,
  currentDocumentPath,
  onCreateDirectory,
  onCreateDocument,
  onImportMarkdown,
  onSelectDocument,
}: DocumentTreeProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set());
  const visibleNodes = filterWorkspaceNodes(nodes, searchQuery);
  const forceExpanded = searchQuery.trim().length > 0;

  if (visibleNodes.length === 0) {
    return (
      <p className="px-2 py-6 text-sm text-muted-foreground">
        没有匹配的文档
      </p>
    );
  }

  return (
    <div className="space-y-0.5 py-2">
      {visibleNodes.map((node) => (
        <TreeNode
          key={node.id}
          currentDocumentPath={currentDocumentPath}
          expanded={expanded}
          forceExpanded={forceExpanded}
          level={0}
          node={node}
          onCreateDirectory={onCreateDirectory}
          onCreateDocument={onCreateDocument}
          onExpandedChange={setExpanded}
          onImportMarkdown={onImportMarkdown}
          onSelectDocument={onSelectDocument}
        />
      ))}
    </div>
  );
}

function TreeNode({
  currentDocumentPath,
  expanded,
  forceExpanded,
  level,
  node,
  onCreateDirectory,
  onCreateDocument,
  onExpandedChange,
  onImportMarkdown,
  onSelectDocument,
}: {
  currentDocumentPath: string | null;
  expanded: Set<string>;
  forceExpanded: boolean;
  level: number;
  node: WorkspaceNode;
  onCreateDirectory: (parentPath: string) => void;
  onCreateDocument: (parentPath: string) => void;
  onExpandedChange: React.Dispatch<React.SetStateAction<Set<string>>>;
  onImportMarkdown: (targetDir: string) => void;
  onSelectDocument: (node: WorkspaceNode) => void;
}) {
  const isDirectory = node.kind === 'directory';
  const isExpanded = forceExpanded || expanded.has(node.id);
  const isCurrent = node.absolutePath === currentDocumentPath;

  return (
    <div>
      <div
        className={cn(
          'group/tree-row flex h-8 w-full items-center rounded-lg text-sm transition-colors hover:bg-muted',
          isCurrent && 'bg-accent',
        )}
      >
        <button
          className="flex h-full min-w-0 flex-1 items-center gap-2 rounded-lg px-2 text-left"
          style={{ paddingLeft: 8 + level * 14 }}
          type="button"
          onClick={() => {
            if (isDirectory) {
              onExpandedChange((previous) => {
                const next = new Set(previous);

                if (next.has(node.id)) {
                  next.delete(node.id);
                } else {
                  next.add(node.id);
                }

                return next;
              });
            } else {
              onSelectDocument(node);
            }
          }}
        >
          {isDirectory ? (
            isExpanded ? (
              <FolderOpen
                className="shrink-0 text-muted-foreground"
                data-testid={`directory-folder-open-${node.id}`}
                size={15}
              />
            ) : (
              <Folder
                className="shrink-0 text-muted-foreground"
                data-testid={`directory-folder-closed-${node.id}`}
                size={15}
              />
            )
          ) : null}
          <span className="truncate">{node.title || node.name}</span>
        </button>

        {isDirectory ? (
          <div className="mr-1 hidden items-center gap-0.5 group-hover/tree-row:flex">
            <TreeActionButton
              label={`在 ${node.name} 中新建文档`}
              onClick={() => onCreateDocument(node.relativePath)}
            >
              <FilePlus2 size={13} />
            </TreeActionButton>
            <TreeActionButton
              label={`在 ${node.name} 中新建目录`}
              onClick={() => onCreateDirectory(node.relativePath)}
            >
              <FolderPlus size={13} />
            </TreeActionButton>
            <TreeActionButton
              label={`导入 Markdown 到 ${node.name}`}
              onClick={() => onImportMarkdown(node.relativePath)}
            >
              <FileInput size={13} />
            </TreeActionButton>
          </div>
        ) : null}
      </div>

      {isDirectory && isExpanded
        ? node.children?.map((child) => (
            <TreeNode
              key={child.id}
              currentDocumentPath={currentDocumentPath}
              expanded={expanded}
              forceExpanded={forceExpanded}
              level={level + 1}
              node={child}
              onCreateDirectory={onCreateDirectory}
              onCreateDocument={onCreateDocument}
              onExpandedChange={onExpandedChange}
              onImportMarkdown={onImportMarkdown}
              onSelectDocument={onSelectDocument}
            />
          ))
        : null}
    </div>
  );
}

function TreeActionButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground"
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      {children}
    </button>
  );
}
