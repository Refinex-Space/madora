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
        name: 'intro.md',
        kind: 'document',
        relativePath: 'Guides/intro.md',
        absolutePath: '/repo/Guides/intro.md',
        title: '入门',
      },
    ],
  },
  {
    id: 'readme',
    name: 'README.md',
    kind: 'document',
    relativePath: 'README.md',
    absolutePath: '/repo/README.md',
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
});
