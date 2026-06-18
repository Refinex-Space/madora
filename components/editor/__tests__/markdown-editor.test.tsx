import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MarkdownEditor } from '@/components/editor/markdown-editor';

const { markoraMock } = vi.hoisted(() => ({
  markoraMock: vi.fn(() => []),
}));

vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}));

vi.mock('@refinex/markora/editor', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@refinex/markora/editor')>();

  return {
    ...actual,
    markora: markoraMock,
  };
});

describe('MarkdownEditor', () => {
  beforeEach(() => {
    markoraMock.mockClear();
  });

  it('渲染编辑器容器', () => {
    render(
      <MarkdownEditor
        documentKey="doc-1"
        markdown="# 标题"
        onMarkdownChange={() => {}}
      />,
    );
    expect(screen.getByTestId('markdown-editor-root')).toBeTruthy();
    expect(document.querySelector('.cm-editor')).toBeTruthy();
  });

  it('Cmd+S 触发 onSaveRequested', () => {
    const onSave = vi.fn();
    render(
      <MarkdownEditor
        documentKey="doc-1"
        markdown="# x"
        onSaveRequested={onSave}
        onMarkdownChange={() => {}}
      />,
    );
    const root = screen.getByTestId('markdown-editor-root');
    fireEvent.keyDown(root, { key: 's', metaKey: true });
    expect(onSave).toHaveBeenCalled();
  });

  it('Ctrl+S 触发 onSaveRequested', () => {
    const onSave = vi.fn();
    render(
      <MarkdownEditor
        documentKey="doc-1"
        markdown="# x"
        onSaveRequested={onSave}
        onMarkdownChange={() => {}}
      />,
    );
    const root = screen.getByTestId('markdown-editor-root');
    fireEvent.keyDown(root, { key: 's', ctrlKey: true });
    expect(onSave).toHaveBeenCalled();
  });

  it('documentKey 变化不抛错', () => {
    const { rerender } = render(
      <MarkdownEditor
        documentKey="doc-1"
        markdown="# a"
        onMarkdownChange={() => {}}
      />,
    );
    expect(() =>
      rerender(
        <MarkdownEditor
          documentKey="doc-2"
          markdown="# b"
          onMarkdownChange={() => {}}
        />,
      ),
    ).not.toThrow();
  });

  it('默认使用 wide 页宽模式', () => {
    render(
      <MarkdownEditor
        documentKey="doc-1"
        markdown="# x"
        onMarkdownChange={() => {}}
      />,
    );

    expect(
      screen
        .getByTestId('markdown-editor-root')
        .getAttribute('data-page-width-mode'),
    ).toBe('wide');
  });

  it('渲染 wide 页宽模式添加 max-w-none', () => {
    render(
      <MarkdownEditor
        documentKey="doc-1"
        markdown="# x"
        pageWidthMode="wide"
        onMarkdownChange={() => {}}
      />,
    );
    const wideWrapper = document.querySelector('.max-w-none');
    expect(wideWrapper).toBeTruthy();
  });

  it('渲染 wide 页宽模式标记 markora 内容层可全宽', () => {
    render(
      <MarkdownEditor
        documentKey="doc-1"
        markdown="# x"
        pageWidthMode="wide"
        onMarkdownChange={() => {}}
      />,
    );

    expect(screen.getByTestId('markdown-editor-root').className).toContain(
      'workspace-editor-page-wide',
    );
  });

  it('wide 页宽模式通过 markora extension 覆盖正文宽度', () => {
    render(
      <MarkdownEditor
        documentKey="doc-1"
        markdown="# x"
        pageWidthMode="wide"
        onMarkdownChange={() => {}}
      />,
    );

    expect(markoraMock).toHaveBeenCalledWith(
      expect.objectContaining({
        extensions: expect.arrayContaining([expect.anything()]),
      }),
    );
  });
});
