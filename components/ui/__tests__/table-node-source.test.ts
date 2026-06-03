import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('table node source contract', () => {
  it('lets editable and static tables expand to the editor content width', () => {
    const tableNodeSource = readFileSync(
      join(process.cwd(), 'components/ui/table-node.tsx'),
      'utf8',
    );
    const staticTableNodeSource = readFileSync(
      join(process.cwd(), 'components/ui/table-node-static.tsx'),
      'utf8',
    );

    expect(tableNodeSource).toContain('className="group/table relative w-full"');
    expect(tableNodeSource).toContain('minWidth: \'100%\'');
    expect(tableNodeSource).toContain(
      "width: usesDefaultColumnSizing\n            ? '100%'",
    );
    expect(tableNodeSource).toContain(
      "'mr-0 table h-px table-fixed border-collapse'",
    );
    expect(tableNodeSource).not.toContain('mr-0 ml-px table h-px');
    expect(staticTableNodeSource).toContain(
      'className="group/table relative w-full"',
    );
    expect(staticTableNodeSource).toContain('minWidth: \'100%\'');
    expect(staticTableNodeSource).toContain(
      'className="mr-0 table h-px table-fixed border-collapse"',
    );
    expect(staticTableNodeSource).not.toContain('mr-0 ml-px table h-px');
  });
});
