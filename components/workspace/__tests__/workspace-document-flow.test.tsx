import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { readDocument, saveDocument } from '../workspace-api';
import { WorkspaceLayout } from '../workspace-layout';
import type { WorkspaceSnapshot } from '../workspace-types';

vi.mock('@/components/editor/plate-editor', () => ({
  PlateEditor: ({
    documentKey,
    markdown,
    onMarkdownChange,
    onSaveRequested,
  }: {
    documentKey?: string;
    markdown?: string;
    onMarkdownChange?: (markdown: string) => void;
    onSaveRequested?: () => void;
  }) => (
    <div>
      <div data-document-key={documentKey} data-testid="plate-editor">
        {markdown}
      </div>
      <button
        type="button"
        onClick={() => onMarkdownChange?.('# 指南\n更新正文')}
      >
        模拟编辑
      </button>
      <button type="button" onClick={() => onSaveRequested?.()}>
        模拟快捷保存
      </button>
    </div>
  ),
}));

vi.mock('../workspace-api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../workspace-api')>();

  return {
    ...actual,
    readDocument: vi.fn(),
    saveDocument: vi.fn(),
    setAppWindowTitle: vi.fn(),
  };
});

const readDocumentMock = vi.mocked(readDocument);
const saveDocumentMock = vi.mocked(saveDocument);

const snapshot: WorkspaceSnapshot = {
  rootPath: '/repo',
  rootName: 'repo',
  nodes: [
    {
      id: 'guide',
      name: 'guide.md',
      kind: 'document',
      relativePath: 'guide.md',
      absolutePath: '/repo/guide.md',
      title: '指南',
    },
    {
      id: 'notes',
      name: 'notes.md',
      kind: 'document',
      relativePath: 'notes.md',
      absolutePath: '/repo/notes.md',
      title: '笔记',
    },
  ],
};

describe('Workspace document flow', () => {
  beforeEach(() => {
    window.localStorage.clear();
    readDocumentMock.mockReset();
    saveDocumentMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads the selected markdown document into the editor', async () => {
    const user = userEvent.setup();
    let resolveDocument: (
      value: Awaited<ReturnType<typeof readDocument>>,
    ) => void = () => {};
    readDocumentMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveDocument = resolve;
      }),
    );

    render(<WorkspaceLayout initialSnapshot={snapshot} />);

    await user.click(screen.getByText('指南'));

    expect(screen.getByText('正在打开文档...')).toBeTruthy();

    resolveDocument({
      path: '/repo/guide.md',
      content: '# 指南\n正文',
      modifiedAt: 1,
    });

    await waitFor(() => {
      expect(screen.getByTestId('plate-editor').textContent).toContain(
        '# 指南',
      );
    });

    expect(readDocumentMock).toHaveBeenCalledWith('/repo', '/repo/guide.md');
    expect(
      screen.getByTestId('plate-editor').getAttribute('data-document-key'),
    ).toBe('/repo/guide.md:1');
  });

  it('shows a document read error without clearing the sidebar', async () => {
    const user = userEvent.setup();
    readDocumentMock.mockRejectedValueOnce(new Error('无法读取文档内容'));

    render(<WorkspaceLayout initialSnapshot={snapshot} />);

    await user.click(screen.getByText('指南'));

    await waitFor(() => {
      expect(screen.getByText('无法读取文档内容')).toBeTruthy();
    });

    expect(screen.getByText('指南')).toBeTruthy();
    expect(screen.queryByTestId('plate-editor')).toBeNull();
  });

  it('auto saves edited markdown after debounce', async () => {
    const user = userEvent.setup();
    readDocumentMock.mockResolvedValueOnce({
      path: '/repo/guide.md',
      content: '# 指南\n正文',
      modifiedAt: 1,
    });
    saveDocumentMock.mockResolvedValueOnce({
      path: '/repo/guide.md',
      modifiedAt: 2,
    });

    render(<WorkspaceLayout initialSnapshot={snapshot} />);

    await user.click(screen.getByText('指南'));
    await screen.findByTestId('plate-editor');
    vi.useFakeTimers();
    fireEvent.click(screen.getByText('模拟编辑'));

    expect(screen.getByText('有未保存更改')).toBeTruthy();

    vi.advanceTimersByTime(800);
    vi.useRealTimers();

    await waitFor(() => {
      expect(saveDocumentMock).toHaveBeenCalledWith(
        '/repo',
        '/repo/guide.md',
        '# 指南\n更新正文',
      );
    });
    await waitFor(() => {
      expect(screen.getByText('已保存')).toBeTruthy();
    });
  });

  it('saves immediately when save is requested', async () => {
    const user = userEvent.setup();
    readDocumentMock.mockResolvedValueOnce({
      path: '/repo/guide.md',
      content: '# 指南\n正文',
      modifiedAt: 1,
    });
    saveDocumentMock.mockResolvedValueOnce({
      path: '/repo/guide.md',
      modifiedAt: 3,
    });

    render(<WorkspaceLayout initialSnapshot={snapshot} />);

    await user.click(screen.getByText('指南'));
    await screen.findByTestId('plate-editor');
    await user.click(screen.getByText('模拟编辑'));
    await user.click(screen.getByText('模拟快捷保存'));

    await waitFor(() => {
      expect(saveDocumentMock).toHaveBeenCalledWith(
        '/repo',
        '/repo/guide.md',
        '# 指南\n更新正文',
      );
    });
  });

  it('keeps edited content visible when save fails', async () => {
    const user = userEvent.setup();
    readDocumentMock.mockResolvedValueOnce({
      path: '/repo/guide.md',
      content: '# 指南\n正文',
      modifiedAt: 1,
    });
    saveDocumentMock.mockRejectedValueOnce(new Error('无法保存文档内容'));

    render(<WorkspaceLayout initialSnapshot={snapshot} />);

    await user.click(screen.getByText('指南'));
    await screen.findByTestId('plate-editor');
    vi.useFakeTimers();
    fireEvent.click(screen.getByText('模拟编辑'));

    vi.advanceTimersByTime(800);
    vi.useRealTimers();

    await waitFor(() => {
      expect(screen.getByText('无法保存文档内容')).toBeTruthy();
    });

    expect(screen.getByTestId('plate-editor')).toBeTruthy();
  });

  it('saves dirty content before opening another document', async () => {
    const user = userEvent.setup();
    readDocumentMock
      .mockResolvedValueOnce({
        path: '/repo/guide.md',
        content: '# 指南\n正文',
        modifiedAt: 1,
      })
      .mockResolvedValueOnce({
        path: '/repo/notes.md',
        content: '# 笔记',
        modifiedAt: 4,
      });
    saveDocumentMock.mockResolvedValueOnce({
      path: '/repo/guide.md',
      modifiedAt: 3,
    });

    render(<WorkspaceLayout initialSnapshot={snapshot} />);

    await user.click(screen.getByText('指南'));
    await screen.findByTestId('plate-editor');
    await user.click(screen.getByText('模拟编辑'));
    await user.click(screen.getByText('笔记'));

    await waitFor(() => {
      expect(saveDocumentMock).toHaveBeenCalledWith(
        '/repo',
        '/repo/guide.md',
        '# 指南\n更新正文',
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId('plate-editor').textContent).toContain(
        '# 笔记',
      );
    });
  });
});
