'use client';

import * as React from 'react';
import { Folder, FolderOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { filterWorkspaceNodes } from './workspace-tree';
import type { WorkspaceNode } from './workspace-types';

interface DocumentTreeProps {
  nodes: WorkspaceNode[];
  searchQuery: string;
  currentDocumentPath: string | null;
  onSelectDocument: (node: WorkspaceNode) => void;
}

export function DocumentTree({
  nodes,
  searchQuery,
  currentDocumentPath,
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
          onExpandedChange={setExpanded}
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
  onExpandedChange,
  onSelectDocument,
}: {
  currentDocumentPath: string | null;
  expanded: Set<string>;
  forceExpanded: boolean;
  level: number;
  node: WorkspaceNode;
  onExpandedChange: React.Dispatch<React.SetStateAction<Set<string>>>;
  onSelectDocument: (node: WorkspaceNode) => void;
}) {
  const isDirectory = node.kind === 'directory';
  const isExpanded = forceExpanded || expanded.has(node.id);
  const isCurrent = node.absolutePath === currentDocumentPath;

  return (
    <div>
      <Button
        className={cn(
          'h-8 w-full justify-start gap-2 px-2 text-left text-sm',
          isCurrent && 'bg-accent',
        )}
        style={{ paddingLeft: 8 + level * 14 }}
        type="button"
        variant="ghost"
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
      </Button>

      {isDirectory && isExpanded
        ? node.children?.map((child) => (
            <TreeNode
              key={child.id}
              currentDocumentPath={currentDocumentPath}
              expanded={expanded}
              forceExpanded={forceExpanded}
              level={level + 1}
              node={child}
              onExpandedChange={onExpandedChange}
              onSelectDocument={onSelectDocument}
            />
          ))
        : null}
    </div>
  );
}
