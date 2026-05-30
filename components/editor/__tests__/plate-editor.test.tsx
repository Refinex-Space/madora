import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MarkdownPlugin } from '@platejs/markdown';

import { PlateEditor } from '../plate-editor';

const deserializeMock = vi.fn();
const serializeMock = vi.fn();
const getApiMock = vi.fn(() => ({
  markdown: {
    deserialize: deserializeMock,
    serialize: serializeMock,
  },
}));
const usePlateEditorMock = vi.fn();

vi.mock('platejs', () => ({
  normalizeStaticValue: vi.fn((value) => value),
}));

vi.mock('@platejs/markdown', () => ({
  MarkdownPlugin: Symbol('MarkdownPlugin'),
}));

vi.mock('platejs/react', () => ({
  Plate: ({
    children,
    onChange,
  }: {
    children: React.ReactNode;
    onChange?: (event: { value: unknown[] }) => void;
  }) => (
    <button
      data-testid="plate-root"
      type="button"
      onClick={() => onChange?.({ value: [{ children: [{ text: '编辑后' }] }] })}
    >
      {children}
    </button>
  ),
  usePlateEditor: (
    options: {
      value?: unknown[] | ((editor: unknown) => unknown[]);
    },
    deps?: React.DependencyList,
  ) => {
    usePlateEditorMock(options, deps);

    if (typeof options.value === 'function') {
      options.value({ getApi: getApiMock });
    }

    return { getApi: getApiMock };
  },
}));

vi.mock('@/components/editor/editor-kit', () => ({
  EditorKit: [],
}));

vi.mock('@/components/editor/settings-dialog', () => ({
  SettingsDialog: () => null,
}));

vi.mock('@/components/ui/editor', () => ({
  Editor: ({
    onKeyDown,
    variant,
  }: {
    onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
    variant?: string;
  }) => (
    <div
      data-testid="editor-surface"
      data-variant={variant}
      role="textbox"
      tabIndex={0}
      onKeyDown={onKeyDown}
    />
  ),
  EditorContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe('PlateEditor', () => {
  beforeEach(() => {
    deserializeMock.mockReset();
    serializeMock.mockReset();
    getApiMock.mockClear();
    usePlateEditorMock.mockClear();
  });

  it('deserializes workspace markdown as the initial editor value', () => {
    deserializeMock.mockReturnValueOnce([
      { children: [{ text: '标题' }], type: 'h1' },
    ]);

    render(
      <PlateEditor
        documentKey="/repo/guide.md:1"
        markdown="# 标题"
        variant="workspace"
      />,
    );

    expect(getApiMock).toHaveBeenCalledWith(MarkdownPlugin);
    expect(deserializeMock).toHaveBeenCalledWith('# 标题');
    expect(usePlateEditorMock.mock.calls[0]?.[1]).toEqual([
      '/repo/guide.md:1',
      'workspace',
    ]);
  });

  it('serializes workspace editor changes to markdown', () => {
    deserializeMock.mockReturnValueOnce([
      { children: [{ text: '标题' }], type: 'h1' },
    ]);
    serializeMock.mockReturnValueOnce('# 编辑后');
    const onMarkdownChange = vi.fn();

    render(
      <PlateEditor
        documentKey="/repo/guide.md:1"
        markdown="# 标题"
        variant="workspace"
        onMarkdownChange={onMarkdownChange}
      />,
    );

    fireEvent.click(screen.getByTestId('plate-root'));

    expect(serializeMock).toHaveBeenCalledWith({
      value: [{ children: [{ text: '编辑后' }] }],
    });
    expect(onMarkdownChange).toHaveBeenCalledWith('# 编辑后');
  });

  it('requests save from the workspace keyboard shortcut', () => {
    deserializeMock.mockReturnValueOnce([
      { children: [{ text: '标题' }], type: 'h1' },
    ]);
    const onSaveRequested = vi.fn();

    render(
      <PlateEditor
        documentKey="/repo/guide.md:1"
        markdown="# 标题"
        variant="workspace"
        onSaveRequested={onSaveRequested}
      />,
    );

    fireEvent.keyDown(screen.getByTestId('editor-surface'), {
      key: 's',
      metaKey: true,
    });

    expect(onSaveRequested).toHaveBeenCalledTimes(1);
  });
});
