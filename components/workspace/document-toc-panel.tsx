import type { DocumentTocSnapshot } from '@/components/editor/document-toc-bridge';

import type { WorkspaceNode } from './workspace-types';

interface DocumentTocPanelProps {
  currentDocument: WorkspaceNode | null;
  snapshot: DocumentTocSnapshot | null;
}

export function DocumentTocPanel({
  currentDocument,
  snapshot,
}: DocumentTocPanelProps) {
  return (
    <>
      <header className="flex h-12 items-center border-b px-3">
        <span className="truncate text-sm font-medium">目录</span>
      </header>
      <div className="min-h-0 flex-1 p-3 text-sm">
        {!currentDocument
          ? '未选择文档'
          : snapshot?.items.length
            ? '目录加载中'
            : '暂无可显示目录'}
      </div>
    </>
  );
}
