import { describe, expect, it } from 'vitest';

import {
  filterWorkspaceNodes,
  flattenDocuments,
  searchWorkspace,
} from '../workspace-tree';
import type { WorkspaceNode } from '../workspace-types';

const nodes: WorkspaceNode[] = [
  {
    id: 'dir-guides',
    name: 'Guides',
    kind: 'directory',
    relativePath: 'Guides',
    absolutePath: '/repo/Guides',
    children: [
      {
        id: 'doc-a',
        name: 'intro.plate.json',
        kind: 'document',
        relativePath: 'Guides/intro.plate.json',
        absolutePath: '/repo/Guides/intro.plate.json',
        title: '入门指南',
      },
    ],
  },
  {
    id: 'doc-root',
    name: 'README.plate.json',
    kind: 'document',
    relativePath: 'README.plate.json',
    absolutePath: '/repo/README.plate.json',
    title: '项目说明',
  },
];

describe('workspace-tree', () => {
  it('flattens native Plate document nodes only', () => {
    expect(flattenDocuments(nodes).map((item) => item.relativePath)).toEqual([
      'Guides/intro.plate.json',
      'README.plate.json',
    ]);
  });

  it('searches by filename, path, and native title', () => {
    expect(searchWorkspace(nodes, '入门')).toHaveLength(1);
    expect(searchWorkspace(nodes, 'guides')).toHaveLength(1);
    expect(searchWorkspace(nodes, 'readme')).toHaveLength(1);
  });

  it('keeps parent directory when descendants match filtered tree', () => {
    expect(filterWorkspaceNodes(nodes, 'intro')).toEqual([
      expect.objectContaining({
        kind: 'directory',
        children: [
          expect.objectContaining({
            relativePath: 'Guides/intro.plate.json',
          }),
        ],
      }),
    ]);
  });
});
