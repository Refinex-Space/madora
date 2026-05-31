'use client';

import * as React from 'react';
import { Cloud, Database, FolderArchive, Server } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import {
  isTauriRuntime,
  readAppSettings,
  saveAppSettings,
} from './workspace-api';
import type { AppSettings } from './workspace-types';

interface WorkspaceSettingsDialogProps {
  open: boolean;
  workspaceRootPath: string | null;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_APP_SETTINGS: AppSettings = {
  schemaVersion: 1,
  storage: {
    defaultProvider: 'local',
  },
};

export function WorkspaceSettingsDialog({
  open,
  workspaceRootPath,
  onOpenChange,
}: WorkspaceSettingsDialogProps) {
  const [settings, setSettings] =
    React.useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [loadState, setLoadState] = React.useState<
    'idle' | 'loading' | 'loaded' | 'error'
  >('idle');
  const [saveState, setSaveState] = React.useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const assetDirectory = workspaceRootPath
    ? `${workspaceRootPath}/.refinex/assets`
    : '打开工作区后使用 .refinex/assets';

  React.useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      if (!open) {
        return;
      }

      setLoadState('loading');
      setSaveState('idle');
      setErrorMessage(null);

      if (!isTauriRuntime()) {
        setSettings(DEFAULT_APP_SETTINGS);
        setLoadState('loaded');
        return;
      }

      try {
        const nextSettings = await readAppSettings();

        if (!cancelled) {
          setSettings(nextSettings);
          setLoadState('loaded');
        }
      } catch (error) {
        if (!cancelled) {
          setLoadState('error');
          setErrorMessage(
            error instanceof Error ? error.message : '无法读取应用设置',
          );
        }
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, [open]);

  async function handleApply() {
    setSaveState('saving');
    setErrorMessage(null);

    if (!isTauriRuntime()) {
      setSaveState('saved');
      return;
    }

    try {
      const savedSettings = await saveAppSettings(settings);

      setSettings(savedSettings);
      setSaveState('saved');
    } catch (error) {
      setSaveState('error');
      setErrorMessage(error instanceof Error ? error.message : '无法保存应用设置');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[min(720px,calc(100vh-48px))] max-w-[980px] gap-0 overflow-hidden p-0 sm:max-w-[980px]">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>设置</DialogTitle>
          <DialogDescription>
            配置全局上传和资源存储方式。
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 grid-cols-[220px_minmax(0,1fr)]">
          <aside className="border-r bg-muted/30 p-3">
            <button
              className="flex h-8 w-full items-center gap-2 rounded-md bg-[#3574f0] px-2 text-left text-sm font-medium text-white"
              type="button"
            >
              <Database size={15} />
              存储
            </button>
          </aside>

          <section className="min-h-0 overflow-auto px-6 py-5">
            <div className="mb-5">
              <h2 className="text-base font-semibold">存储</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                选择上传资源的默认存储方式。本期仅启用工作区本地存储。
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-[160px_minmax(0,320px)] items-center gap-3">
                <label
                  className="text-sm font-medium"
                  htmlFor="storage-provider"
                >
                  全局存储方式
                </label>
                <Select
                  value={settings.storage.defaultProvider}
                  onValueChange={(value) =>
                    setSettings({
                      schemaVersion: 1,
                      storage: { defaultProvider: value as 'local' },
                    })
                  }
                >
                  <SelectTrigger
                    id="storage-provider"
                    aria-label="全局存储方式"
                    className="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">
                      <span className="flex items-center gap-2">
                        <FolderArchive size={15} />
                        本地存储
                      </span>
                    </SelectItem>
                    <SelectItem value="oss" disabled>
                      <span className="flex items-center gap-2">
                        <Cloud size={15} />
                        OSS 存储
                      </span>
                    </SelectItem>
                    <SelectItem value="api" disabled>
                      <span className="flex items-center gap-2">
                        <Server size={15} />
                        自定义 API
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 rounded-lg border bg-background p-4">
                <div>
                  <h3 className="text-sm font-semibold">本地存储配置</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    上传文件跟随当前工作区保存，文档中仅写入稳定的资源引用。
                  </p>
                </div>

                <div className="grid gap-3">
                  <ReadonlyField
                    label="资源目录"
                    value={assetDirectory}
                  />
                  <ReadonlyField
                    label="引用格式"
                    value="refinex-asset://{assetId}"
                  />
                  <ReadonlyField
                    label="清理策略"
                    value="保存或删除文档时清理未引用资源"
                  />
                </div>
              </div>

              <div
                className={cn(
                  'rounded-md border px-3 py-2 text-sm',
                  errorMessage
                    ? 'border-destructive/40 text-destructive'
                    : 'border-transparent text-muted-foreground',
                )}
              >
                {errorMessage ??
                  (saveState === 'saved' ? '设置已保存。' : '当前配置会作为全局上传默认值。')}
              </div>
            </div>
          </section>
        </div>

        <DialogFooter className="rounded-none">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            disabled={loadState === 'loading' || saveState === 'saving'}
            type="button"
            onClick={() => void handleApply()}
          >
            应用
          </Button>
          <Button
            disabled={loadState === 'loading' || saveState === 'saving'}
            type="button"
            onClick={async () => {
              await handleApply();
              onOpenChange(false);
            }}
          >
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <Input className="font-mono text-xs" readOnly value={value} />
    </label>
  );
}
