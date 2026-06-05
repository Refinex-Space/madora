import { describe, expect, it, vi } from 'vitest';

import {
  createEmptyMarkdownDocument,
  markdownToPlateValue,
  parseMarkdownDocument,
  plateValueToMarkdown,
  serializeMarkdownDocument,
} from '../markdown-document';

vi.mock('platejs/react', () => ({
  createPlateEditor: ({ value }: { value?: unknown[] }) => ({
    getApi: () => ({
      markdown: {
        deserialize: (markdown: string) =>
          markdown.trim()
            ? [
                {
                  children: [{ text: markdown.replace(/^#\s+/m, '') }],
                  type: 'p',
                },
              ]
            : [],
        serialize: ({ value: inputValue }: { value?: unknown[] } = {}) =>
          (inputValue ?? value ?? [])
            .map(
              (node) =>
                (node as { children?: Array<{ text?: string }> }).children?.[0]
                  ?.text ?? '',
            )
            .join('\n\n'),
      },
    }),
  }),
}));

vi.mock('@/components/editor/editor-kit', () => ({
  EditorKit: [],
}));

describe('markdown-document', () => {
  it('parses frontmatter, body, and title', () => {
    const document = parseMarkdownDocument(
      '---\ntitle: 指南\ncreatedAt: 2026-06-05T00:00:00.000Z\nupdatedAt: 2026-06-05T00:00:00.000Z\nrefinexDialect: 1\n---\n\n# 正文标题\n\n内容',
      'guide.md',
    );

    expect(document.metadata.title).toBe('指南');
    expect(document.metadata.refinexDialect).toBe(1);
    expect(document.body).toBe('# 正文标题\n\n内容');
  });

  it('uses first h1 as title when frontmatter has no title', () => {
    const document = parseMarkdownDocument('# 入门\n\n正文', 'intro.md');

    expect(document.metadata.title).toBe('入门');
  });

  it('uses file stem as title when content has no title', () => {
    const document = parseMarkdownDocument('正文', 'quick-note.md');

    expect(document.metadata.title).toBe('quick-note');
  });

  it('serializes metadata and body as Markdown', () => {
    const markdown = serializeMarkdownDocument({
      body: '# 指南\n\n正文',
      metadata: {
        createdAt: '2026-06-05T00:00:00.000Z',
        refinexDialect: 1,
        title: '指南',
        updatedAt: '2026-06-05T00:01:00.000Z',
      },
    });

    expect(markdown).toContain('title: 指南');
    expect(markdown).toContain('refinexDialect: 1');
    expect(markdown).toContain('# 指南\n\n正文');
    expect(markdown.endsWith('\n')).toBe(true);
  });

  it('creates editable empty Markdown document', () => {
    const document = createEmptyMarkdownDocument('未命名文档');

    expect(document).toContain('title: 未命名文档');
    expect(document).toContain('# 未命名文档');
  });

  it('round trips between Markdown and Plate value', () => {
    const value = markdownToPlateValue('# 标题');
    const markdown = plateValueToMarkdown(value);

    expect(value).toEqual([{ children: [{ text: '标题' }], type: 'p' }]);
    expect(markdown).toBe('标题');
  });
});
