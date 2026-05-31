import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('FixedToolbarButtons source structure', () => {
  it('keeps pinned controls outside the responsive overflow toolbar flow', () => {
    const source = readFileSync(
      join(process.cwd(), 'components/ui/fixed-toolbar-buttons.tsx'),
      'utf8',
    );
    const globalsSource = readFileSync(
      join(process.cwd(), 'app/globals.css'),
      'utf8',
    );

    expect(source).toContain('fixed-toolbar-buttons flex w-full min-w-0');
    expect(source).toContain('fixed-toolbar-main flex min-w-0');
    expect(source).toContain('fixed-toolbar-pinned flex shrink-0');
    expect(source).toContain('fixed-toolbar-collapse-1');
    expect(source).toContain('fixed-toolbar-collapse-2');
    expect(source).toContain('fixed-toolbar-collapse-3');
    expect(source).toContain(
      '<MoreToolbarButton overflowContent={<FixedToolbarOverflowTools />} />',
    );
    expect(source).toContain('function FixedToolbarOverflowTools()');
    expect(globalsSource).toContain('container-type: inline-size');
    expect(globalsSource).toContain('@container (max-width: 1620px)');
    expect(globalsSource).toContain('@container (max-width: 1450px)');
    expect(globalsSource).toContain('@container (max-width: 1180px)');
  });
});
