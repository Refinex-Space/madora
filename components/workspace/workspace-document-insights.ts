import type { Value } from 'platejs';

import { LOCAL_ASSET_URL_PREFIX } from './workspace-local-assets';

export interface DocumentResourceReference {
  id: string;
  nodeType: string;
  url: string;
}

export function countPlateDocumentCharacters(value: Value | undefined) {
  if (!value) {
    return 0;
  }

  return value.reduce((count, node) => count + countNodeCharacters(node), 0);
}

export function extractDocumentResourceReferences(
  value: Value | undefined,
): DocumentResourceReference[] {
  if (!value) {
    return [];
  }

  const references = new Map<string, DocumentResourceReference>();

  for (const node of value) {
    collectDocumentResourceReferences(node, references, 'unknown');
  }

  return Array.from(references.values());
}

function countNodeCharacters(node: unknown): number {
  if (!node || typeof node !== 'object') {
    return 0;
  }

  const record = node as { children?: unknown; text?: unknown };
  const textCount =
    typeof record.text === 'string'
      ? Array.from(record.text.replace(/\s+/g, '')).length
      : 0;
  const childrenCount = Array.isArray(record.children)
    ? record.children.reduce(
        (count, child) => count + countNodeCharacters(child),
        0,
      )
    : 0;

  return textCount + childrenCount;
}

function collectDocumentResourceReferences(
  node: unknown,
  references: Map<string, DocumentResourceReference>,
  parentType: string,
) {
  if (Array.isArray(node)) {
    node.forEach((child) =>
      collectDocumentResourceReferences(child, references, parentType),
    );
    return;
  }

  if (!node || typeof node !== 'object') {
    return;
  }

  const record = node as Record<string, unknown>;
  const nodeType = typeof record.type === 'string' ? record.type : parentType;

  for (const value of Object.values(record)) {
    if (typeof value !== 'string' || !value.startsWith(LOCAL_ASSET_URL_PREFIX)) {
      continue;
    }

    const id = value.slice(LOCAL_ASSET_URL_PREFIX.length).trim();

    if (id && !references.has(id)) {
      references.set(id, {
        id,
        nodeType,
        url: value,
      });
    }
  }

  for (const child of Object.values(record)) {
    collectDocumentResourceReferences(child, references, nodeType);
  }
}
