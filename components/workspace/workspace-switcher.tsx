'use client';

import * as React from 'react';
import { ChevronUp, Clock3, FolderOpen, Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { WorkspaceHistoryItem, WorkspaceSnapshot } from './workspace-types';

interface WorkspaceSwitcherProps {
  currentWorkspace: WorkspaceSnapshot | null;
  history: WorkspaceHistoryItem[];
  isLoading: boolean;
  onOpenWorkspace: () => void;
  onRemoveWorkspace: (rootPath: string) => void;
  onSwitchWorkspace: (rootPath: string) => void;
}

export function WorkspaceSwitcher({
  currentWorkspace,
  history,
  isLoading,
  onOpenWorkspace,
  onRemoveWorkspace,
  onSwitchWorkspace,
}: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const title = currentWorkspace?.rootName ?? '打开工作区';
  const subtitle = currentWorkspace?.rootPath ?? '选择目录开始';

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (!rootRef.current?.contains(target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative border-t bg-background/80 p-2">
      {isOpen ? (
        <div className="absolute bottom-[72px] left-2 right-2 z-30 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg">
          {history.length > 0 ? (
            <div className="p-2">
              <div className="flex items-center gap-2 px-2 pb-2 pt-1 text-xs font-medium text-muted-foreground">
                <Clock3 size={13} />
                最近工作区
              </div>
              <div className="max-h-64 overflow-y-auto">
                {history.map((item) => (
                  <div
                    key={item.rootPath}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted',
                      item.rootPath === currentWorkspace?.rootPath && 'bg-muted',
                    )}
                  >
                    <button
                      className="min-w-0 flex-1 text-left"
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onSwitchWorkspace(item.rootPath);
                      }}
                    >
                      <span className="block truncate font-medium">
                        {item.rootName}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.rootPath}
                      </span>
                    </button>
                    <button
                      aria-label={`移除工作区 ${item.rootName}`}
                      className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground"
                      type="button"
                      onClick={() => onRemoveWorkspace(item.rootPath)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <Button
                className="mt-2 w-full justify-start"
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsOpen(false);
                  onOpenWorkspace();
                }}
              >
                <Plus size={14} />
                选择其他目录
              </Button>
            </div>
          ) : (
            <div className="space-y-3 p-4 text-sm">
              <div>
                <p className="font-medium">还没有打开过的工作区</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  选择一个工作区目录，后续可在这里快速切换。
                </p>
              </div>
              <Button
                className="w-full"
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenWorkspace();
                }}
              >
                <FolderOpen size={15} />
                选择目录
              </Button>
            </div>
          )}
        </div>
      ) : null}

      <button
        aria-expanded={isOpen}
        aria-label="打开工作区菜单"
        className="flex h-14 w-full items-center gap-2 rounded-lg border bg-background px-3 text-left shadow-sm transition-colors hover:bg-muted/60"
        disabled={isLoading}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{title}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {subtitle}
          </span>
        </span>
        <ChevronUp
          className={cn(
            'shrink-0 text-muted-foreground transition-transform',
            isOpen && 'rotate-180',
          )}
          size={15}
        />
      </button>
    </div>
  );
}
