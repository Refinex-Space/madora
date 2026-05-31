import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('toolbar dropdown width source', () => {
  it('keeps insert and turn-into menus wider than their toolbar triggers', () => {
    const insertSource = readFileSync(
      join(process.cwd(), 'components/ui/insert-toolbar-button.tsx'),
      'utf8',
    );
    const turnIntoSource = readFileSync(
      join(process.cwd(), 'components/ui/turn-into-toolbar-button.tsx'),
      'utf8',
    );

    expect(insertSource).toContain('w-[220px] min-w-[220px]');
    expect(turnIntoSource).toContain('w-[220px] min-w-[220px]');
    expect(insertSource).not.toContain(
      'className="flex max-h-[500px] min-w-0',
    );
    expect(turnIntoSource).not.toContain(
      'className="ignore-click-outside/toolbar min-w-0"',
    );
  });
});
