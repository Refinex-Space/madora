import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { readPlateDocument, savePlateDocument } from '../workspace-api';
import { WorkspaceLayout } from '../workspace-layout';
import type { PlateDocumentEnvelope, WorkspaceSnapshot } from '../workspace-types';

vi.mock('@/components/editor/plate-editor', () => ({
  PlateEditor: ({
    documentKey,
    onSaveRequested,
    onValueChange,
    value,
  }: {
    documentKey?: string;
    onSaveRequested?: () => void;
    onValueChange?: (value: PlateDocumentEnvelope['content']) => void;
    value?: PlateDocumentEnvelope['content'];
  }) => (
    <div>
      <div data-document-key={documentKey} data-testid="plate-editor">
        {JSON.stringify(value)}
      </div>
      <button
        type="button"
        onClick={() =>
          onValueChange?.([{ type: 'p', children: [{ text: '更新正文' }] }])
        }
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
    readPlateDocument: vi.fn(),
    savePlateDocument: vi.fn(),
    setAppWindowTitle: vi.fn(),
  };
});

const readPlateDocumentMock = vi.mocked(readPlateDocument);
const savePlateDocumentMock = vi.mocked(savePlateDocument);

const guideEnvelope: PlateDocumentEnvelope = {
  schemaVersion: 1,
  title: '指南',
  createdAt: '2026-05-30T00:00:00.000Z',
  updatedAt: '2026-05-30T00:00:00.000Z',
  content: [{ type: 'p', children: [{ text: '正文' }] }],
};

const notesEnvelope: PlateDocumentEnvelope = {
  schemaVersion: 1,
  title: '笔记',
  createdAt: '2026-05-30T00:00:00.000Z',
  updatedAt: '2026-05-30T00:00:00.000Z',
  content: [{ type: 'p', children: [{ text: '笔记正文' }] }],
};

const snapshot: WorkspaceSnapshot = {
  rootPath: '/repo',
  rootName: 'repo',
  nodes: [
    {
      id: 'guide',
      name: 'guide.plate.json',
      kind: 'document',
      relativePath: 'guide.plate.json',
      absolutePath: '/repo/guide.plate.json',
      title: '指南',
    },
    {
      id: 'notes',
      name: 'notes.plate.json',
      kind: 'document',
      relativePath: 'notes.plate.json',
      absolutePath: '/repo/notes.plate.json',
      title: '笔记',
    },
  ],
};

describe('Workspace native document flow', () => {
  beforeEach(() => {
    window.localStorage.clear();
    readPlateDocumentMock.mockReset();
    savePlateDocumentMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads the selected native document into the editor', async () => {
    const user = userEvent.setup();
    readPlateDocumentMock.mockResolvedValueOnce({
      path: '/repo/guide.plate.json',
      envelope: guideEnvelope,
      modifiedAt: 1,
    });

    render(<WorkspaceLayout initialSnapshot={snapshot} />);

    await user.click(screen.getByText('指南'));

    await waitFor(() => {
      expect(screen.getByTestId('plate-editor').textContent).toContain('正文');
    });

    expect(readPlateDocumentMock).toHaveBeenCalledWith(
      '/repo',
      '/repo/guide.plate.json',
    );
    expect(
      screen.getByTestId('plate-editor').getAttribute('data-document-key'),
    ).toBe('/repo/guide.plate.json:1');
  });

  it('auto saves edited native content after debounce', async () => {
    const user = userEvent.setup();
    readPlateDocumentMock.mockResolvedValueOnce({
      path: '/repo/guide.plate.json',
      envelope: guideEnvelope,
      modifiedAt: 1,
    });
    savePlateDocumentMock.mockResolvedValueOnce({
      path: '/repo/guide.plate.json',
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
      expect(savePlateDocumentMock).toHaveBeenCalledWith(
        '/repo',
        '/repo/guide.plate.json',
        expect.objectContaining({
          title: '指南',
          content: [{ type: 'p', children: [{ text: '更新正文' }] }],
        }),
      );
    });
    await waitFor(() => {
      expect(screen.getByText('已保存')).toBeTruthy();
    });
  });

  it('saves immediately when save is requested', async () => {
    const user = userEvent.setup();
    readPlateDocumentMock.mockResolvedValueOnce({
      path: '/repo/guide.plate.json',
      envelope: guideEnvelope,
      modifiedAt: 1,
    });
    savePlateDocumentMock.mockResolvedValueOnce({
      path: '/repo/guide.plate.json',
      modifiedAt: 3,
    });

    render(<WorkspaceLayout initialSnapshot={snapshot} />);

    await user.click(screen.getByText('指南'));
    await screen.findByTestId('plate-editor');
    await user.click(screen.getByText('模拟编辑'));
    await user.click(screen.getByText('模拟快捷保存'));

    await waitFor(() => {
      expect(savePlateDocumentMock).toHaveBeenCalledWith(
        '/repo',
        '/repo/guide.plate.json',
        expect.objectContaining({
          content: [{ type: 'p', children: [{ text: '更新正文' }] }],
        }),
      );
    });
  });

  it('keeps edited content visible when save fails', async () => {
    const user = userEvent.setup();
    readPlateDocumentMock.mockResolvedValueOnce({
      path: '/repo/guide.plate.json',
      envelope: guideEnvelope,
      modifiedAt: 1,
    });
    savePlateDocumentMock.mockRejectedValueOnce(new Error('无法保存文档内容'));

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
    readPlateDocumentMock
      .mockResolvedValueOnce({
        path: '/repo/guide.plate.json',
        envelope: guideEnvelope,
        modifiedAt: 1,
      })
      .mockResolvedValueOnce({
        path: '/repo/notes.plate.json',
        envelope: notesEnvelope,
        modifiedAt: 4,
      });
    savePlateDocumentMock.mockResolvedValueOnce({
      path: '/repo/guide.plate.json',
      modifiedAt: 3,
    });

    render(<WorkspaceLayout initialSnapshot={snapshot} />);

    await user.click(screen.getByText('指南'));
    await screen.findByTestId('plate-editor');
    await user.click(screen.getByText('模拟编辑'));
    await user.click(screen.getByText('笔记'));

    await waitFor(() => {
      expect(savePlateDocumentMock).toHaveBeenCalledWith(
        '/repo',
        '/repo/guide.plate.json',
        expect.objectContaining({
          content: [{ type: 'p', children: [{ text: '更新正文' }] }],
        }),
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId('plate-editor').textContent).toContain(
        '笔记正文',
      );
    });
  });
});
