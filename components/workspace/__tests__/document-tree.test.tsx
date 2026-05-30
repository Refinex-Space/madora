import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DocumentTree } from '../document-tree';
import type { WorkspaceNode } from '../workspace-types';

const nodes: WorkspaceNode[] = [
  {
    id: 'guides',
    name: 'Guides',
    kind: 'directory',
    relativePath: 'Guides',
    absolutePath: '/repo/Guides',
    children: [
      {
        id: 'intro',
        name: 'intro.plate.json',
        kind: 'document',
        relativePath: 'Guides/intro.plate.json',
        absolutePath: '/repo/Guides/intro.plate.json',
        title: '入门',
      },
    ],
  },
  {
    id: 'readme',
    name: 'README.plate.json',
    kind: 'document',
    relativePath: 'README.plate.json',
    absolutePath: '/repo/README.plate.json',
    title: '项目说明',
  },
];

describe('DocumentTree', () => {
  it('uses folder state icons for directories and no icons for documents', async () => {
    const user = userEvent.setup();

    render(
      <DocumentTree
        currentDocumentPath={null}
        nodes={nodes}
        searchQuery=""
        onCreateDirectory={vi.fn()}
        onCreateDocument={vi.fn()}
        onImportMarkdown={vi.fn()}
        onSelectDocument={vi.fn()}
      />,
    );

    expect(screen.queryByTestId('directory-chevron-guides')).toBeNull();
    expect(screen.getByTestId('directory-folder-closed-guides')).toBeTruthy();
    expect(screen.queryByTestId('directory-folder-open-guides')).toBeNull();
    expect(screen.queryByTestId('document-icon-readme')).toBeNull();

    await user.click(screen.getByText('Guides'));

    expect(screen.getByTestId('directory-folder-open-guides')).toBeTruthy();
    expect(screen.queryByTestId('directory-folder-closed-guides')).toBeNull();
  });

  it('selects native documents and exposes folder actions', async () => {
    const user = userEvent.setup();
    const onSelectDocument = vi.fn();
    const onCreateDocument = vi.fn();
    const onCreateDirectory = vi.fn();
    const onImportMarkdown = vi.fn();

    render(
      <DocumentTree
        currentDocumentPath={null}
        nodes={nodes}
        searchQuery=""
        onCreateDirectory={onCreateDirectory}
        onCreateDocument={onCreateDocument}
        onImportMarkdown={onImportMarkdown}
        onSelectDocument={onSelectDocument}
      />,
    );

    await user.click(screen.getByText('Guides'));
    await user.click(screen.getByText('入门'));

    expect(onSelectDocument).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'intro.plate.json' }),
    );

    await user.click(screen.getByLabelText('在 Guides 中新建文档'));
    await user.click(screen.getByLabelText('在 Guides 中新建目录'));
    await user.click(screen.getByLabelText('导入 Markdown 到 Guides'));

    expect(onCreateDocument).toHaveBeenCalledWith('Guides');
    expect(onCreateDirectory).toHaveBeenCalledWith('Guides');
    expect(onImportMarkdown).toHaveBeenCalledWith('Guides');
  });
});
