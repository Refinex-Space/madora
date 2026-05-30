import { invoke } from '@tauri-apps/api/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getRecentWorkspacePath,
  getWorkspaceHistory,
  readDocument,
  recordWorkspaceHistory,
  removeWorkspaceHistory,
  saveDocument,
} from '../workspace-api';
import type { WorkspaceSnapshot } from '../workspace-types';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

const invokeMock = vi.mocked(invoke);

const snapshot: WorkspaceSnapshot = {
  rootPath: '/repo',
  rootName: 'repo',
  nodes: [],
};

describe('workspace-api history', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('records opened workspaces as most recent first', () => {
    recordWorkspaceHistory(snapshot);
    recordWorkspaceHistory({
      rootPath: '/docs',
      rootName: 'docs',
      nodes: [],
    });

    expect(getWorkspaceHistory()).toEqual([
      expect.objectContaining({ rootName: 'docs', rootPath: '/docs' }),
      expect.objectContaining({ rootName: 'repo', rootPath: '/repo' }),
    ]);
    expect(getRecentWorkspacePath()).toBe('/docs');
  });

  it('deduplicates an existing workspace path', () => {
    recordWorkspaceHistory(snapshot);
    recordWorkspaceHistory({
      rootPath: '/repo',
      rootName: 'repo-renamed',
      nodes: [],
    });

    expect(getWorkspaceHistory()).toHaveLength(1);
    expect(getWorkspaceHistory()[0]).toEqual(
      expect.objectContaining({ rootName: 'repo-renamed', rootPath: '/repo' }),
    );
  });

  it('removes a workspace from history without deleting other entries', () => {
    recordWorkspaceHistory(snapshot);
    recordWorkspaceHistory({
      rootPath: '/docs',
      rootName: 'docs',
      nodes: [],
    });

    expect(removeWorkspaceHistory('/docs')).toEqual([
      expect.objectContaining({ rootName: 'repo', rootPath: '/repo' }),
    ]);
    expect(getRecentWorkspacePath()).toBe('/repo');
  });
});

describe('workspace-api document IO', () => {
  beforeEach(() => {
    invokeMock.mockReset();
  });

  it('reads a markdown document through Tauri', async () => {
    invokeMock.mockResolvedValueOnce({
      path: '/repo/README.md',
      content: '# 项目说明',
      modifiedAt: 1,
    });

    await expect(readDocument('/repo', '/repo/README.md')).resolves.toEqual({
      path: '/repo/README.md',
      content: '# 项目说明',
      modifiedAt: 1,
    });

    expect(invokeMock).toHaveBeenCalledWith('read_document', {
      rootPath: '/repo',
      documentPath: '/repo/README.md',
    });
  });

  it('saves a markdown document through Tauri', async () => {
    invokeMock.mockResolvedValueOnce({
      path: '/repo/README.md',
      modifiedAt: 2,
    });

    await expect(
      saveDocument('/repo', '/repo/README.md', '# 更新'),
    ).resolves.toEqual({
      path: '/repo/README.md',
      modifiedAt: 2,
    });

    expect(invokeMock).toHaveBeenCalledWith('save_document', {
      rootPath: '/repo',
      documentPath: '/repo/README.md',
      content: '# 更新',
    });
  });
});
