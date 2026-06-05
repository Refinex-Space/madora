import { MarkdownPlugin } from '@platejs/markdown';
import type { Value } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { EditorKit } from '@/components/editor/editor-kit';

export interface MarkdownDocumentMetadata {
  title: string;
  createdAt: string | null;
  updatedAt: string | null;
  refinexDialect: number;
}

export interface ParsedMarkdownDocument {
  body: string;
  metadata: MarkdownDocumentMetadata;
}

const emptyValue: Value = [{ children: [{ text: '' }], type: 'p' }];

export function parseMarkdownDocument(
  markdown: string,
  fileName: string,
): ParsedMarkdownDocument {
  const { body, frontmatter } = splitFrontmatter(markdown);
  const title =
    readString(frontmatter.title) ??
    extractMarkdownTitle(body) ??
    fileStem(fileName);

  return {
    body,
    metadata: {
      createdAt: readString(frontmatter.createdAt),
      refinexDialect: readNumber(frontmatter.refinexDialect) ?? 1,
      title,
      updatedAt: readString(frontmatter.updatedAt),
    },
  };
}

export function serializeMarkdownDocument(document: ParsedMarkdownDocument) {
  const { metadata } = document;
  const frontmatter = [
    '---',
    `title: ${metadata.title}`,
    metadata.createdAt ? `createdAt: ${metadata.createdAt}` : null,
    metadata.updatedAt ? `updatedAt: ${metadata.updatedAt}` : null,
    `refinexDialect: ${metadata.refinexDialect}`,
    '---',
  ]
    .filter((line): line is string => line !== null)
    .join('\n');
  const body = document.body.trimEnd();

  return `${frontmatter}\n\n${body}\n`;
}

export function createEmptyMarkdownDocument(title: string) {
  const now = new Date().toISOString();

  return serializeMarkdownDocument({
    body: `# ${title}`,
    metadata: {
      createdAt: now,
      refinexDialect: 1,
      title,
      updatedAt: now,
    },
  });
}

export function markdownToPlateValue(markdown: string): Value {
  const editor = createPlateEditor({
    plugins: EditorKit,
  });
  const value = editor.getApi(MarkdownPlugin).markdown.deserialize(markdown);

  return value.length > 0 ? value : emptyValue;
}

export function plateValueToMarkdown(value: Value): string {
  const editor = createPlateEditor({
    plugins: EditorKit,
    value,
  });

  return editor.getApi(MarkdownPlugin).markdown.serialize({ value });
}

function splitFrontmatter(markdown: string) {
  if (!markdown.startsWith('---\n')) {
    return {
      body: markdown.trimStart(),
      frontmatter: {} as Record<string, string>,
    };
  }

  const endIndex = markdown.indexOf('\n---', 4);
  if (endIndex === -1) {
    return {
      body: markdown.trimStart(),
      frontmatter: {} as Record<string, string>,
    };
  }

  const rawFrontmatter = markdown.slice(4, endIndex);
  const body = markdown.slice(endIndex + 4).replace(/^\r?\n/, '');
  const frontmatter = Object.fromEntries(
    rawFrontmatter
      .split(/\r?\n/)
      .map((line) => line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/))
      .filter((match): match is RegExpMatchArray => match !== null)
      .map((match) => [match[1], unquote(match[2].trim())]),
  );

  return { body: body.trimStart(), frontmatter };
}

function extractMarkdownTitle(markdown: string) {
  return markdown
    .split(/\r?\n/, 120)
    .map((line) => line.trim())
    .find((line) => line.startsWith('# ') && line.length > 2)
    ?.replace(/^#\s+/, '')
    .trim();
}

function fileStem(fileName: string) {
  return fileName.replace(/\.(md|mdx)$/i, '') || '未命名文档';
}

function readString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readNumber(value: unknown) {
  const parsed = typeof value === 'string' ? Number(value) : NaN;

  return Number.isFinite(parsed) ? parsed : null;
}

function unquote(value: string) {
  return value.replace(/^["']|["']$/g, '');
}
