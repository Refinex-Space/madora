import JSZip from 'jszip';
import { describe, expect, it, vi } from 'vitest';

import { buildExportArchiveEntries } from '../workspace-document-transfer';
import { createExportArchiveBlob } from '../workspace-export-archive';

vi.mock('@/components/editor/editor-base-kit', () => ({
  BaseEditorKit: [],
}));

vi.mock('@/components/editor/plugins/docx-export-kit', () => ({
  DocxExportKit: [],
}));

vi.mock('@/components/editor/markdown-import', () => ({
  extractMarkdownImportTitle: (content: string, fileName: string) =>
    content.match(/^#\s+(.+)$/m)?.[1] ?? fileName.replace(/\.[^.]+$/u, ''),
}));

vi.mock('@/components/ui/editor-static', () => ({
  EditorStatic: () => null,
}));

describe('workspace-document-transfer', () => {
  it('creates export archives with safe relative entries', async () => {
    const archive = await createExportArchiveBlob([
      {
        path: 'Guides/intro.md',
        base64Data: '5q2j5paH',
      },
    ]);
    const zip = await JSZip.loadAsync(await archive.arrayBuffer());

    await expect(zip.file('Guides/intro.md')?.async('string')).resolves.toBe(
      '正文',
    );
  });

  it('rejects archive entries that escape the zip root', async () => {
    await expect(
      createExportArchiveBlob([
        {
          path: '../bad.md',
          base64Data: 'YQ==',
        },
      ]),
    ).rejects.toThrow('压缩包条目路径无效');
  });

  it('uses raw Markdown content for Markdown archive exports', async () => {
    const readDocument = vi.fn(async () => ({
      content: [{ children: [{ text: 'serialized' }], type: 'p' }],
      createdAt: '2026-06-01T00:00:00.000Z',
      schemaVersion: 1 as const,
      title: 'intro',
      updatedAt: '2026-06-01T00:00:00.000Z',
    }));
    const readRawMarkdown = vi.fn(async () => '# 原始 Markdown\n');

    const entries = await buildExportArchiveEntries({
      format: 'markdown',
      node: {
        absolutePath: '/repo/Guides',
        children: [
          {
            absolutePath: '/repo/Guides/intro.md',
            id: 'intro',
            kind: 'document',
            name: 'intro.md',
            relativePath: 'Guides/intro.md',
            title: 'intro',
          },
        ],
        id: 'guides',
        kind: 'directory',
        name: 'Guides',
        relativePath: 'Guides',
      },
      readDocument,
      readRawMarkdown,
    });

    expect(readRawMarkdown).toHaveBeenCalledTimes(1);
    expect(Buffer.from(entries[0].base64Data, 'base64').toString('utf8')).toBe(
      '# 原始 Markdown\n',
    );
  });
});
