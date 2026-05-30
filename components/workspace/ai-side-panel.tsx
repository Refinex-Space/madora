import { Bot, ListTree, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { WorkspaceNode } from './workspace-types';

interface AiSidePanelProps {
  currentDocument: WorkspaceNode | null;
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function AiSidePanel({
  currentDocument,
  isCollapsed,
  onCollapsedChange,
}: AiSidePanelProps) {
  return (
    <>
      {isCollapsed ? null : (
        <aside
          className="flex h-full w-[340px] shrink-0 flex-col overflow-hidden rounded-lg border bg-background shadow-sm"
          data-testid="ai-panel-island"
        >
          <header className="flex h-12 items-center border-b px-3">
            <span className="truncate text-sm font-medium">AI 助手</span>
          </header>

          <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium">
                {currentDocument?.title || currentDocument?.name || '未选择文档'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                AI 能力尚未接入。
              </p>
            </div>

            <div className="grid gap-2">
              <Button className="justify-start" type="button" variant="outline">
                <Sparkles size={15} />
                总结此页面
              </Button>
              <Button className="justify-start" type="button" variant="outline">
                <Bot size={15} />
                解释选中内容
              </Button>
              <Button className="justify-start" type="button" variant="outline">
                <ListTree size={15} />
                生成大纲
              </Button>
            </div>

            <textarea
              className="mt-auto min-h-24 resize-none rounded-md border bg-background p-3 text-sm outline-none"
              disabled
              placeholder="使用 AI 处理各种任务..."
            />
          </div>
        </aside>
      )}

      <nav
        className="flex h-full w-8 shrink-0 flex-col items-center gap-2 py-1"
        data-testid="right-tool-rail"
      >
        <button
          aria-label={isCollapsed ? '展开 AI 面板' : '折叠 AI 面板'}
          className={cn(
            'flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background/70 hover:text-foreground',
            !isCollapsed &&
              'bg-[#3574f0] text-white shadow-sm hover:bg-[#3574f0] hover:text-white',
          )}
          type="button"
          onClick={() => onCollapsedChange(!isCollapsed)}
        >
          <span
            aria-hidden="true"
            className="size-[17px] bg-current"
            data-testid="ai-panel-icon"
            style={{
              WebkitMask:
                "url('/icons/ai-panel.svg') center / contain no-repeat",
              mask: "url('/icons/ai-panel.svg') center / contain no-repeat",
            }}
          />
        </button>
      </nav>
    </>
  );
}
