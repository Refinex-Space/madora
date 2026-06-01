import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { GitDiffView } from '../git-diff-view';

describe('GitDiffView', () => {
  it('shows empty state before selecting a file', () => {
    render(<GitDiffView diff={null} error={null} isLoading={false} />);

    expect(screen.getByText('选择左侧变更查看差异')).toBeTruthy();
  });

  it('renders added and removed lines', () => {
    render(
      <GitDiffView
        diff={{
          binary: false,
          content: '@@ -1 +1 @@\n-old\n+new',
          path: 'docs/a.md',
          staged: false,
          truncated: false,
        }}
        error={null}
        isLoading={false}
      />,
    );

    expect(screen.getByText('docs/a.md')).toBeTruthy();
    expect(screen.getByText('-old')).toBeTruthy();
    expect(screen.getByText('+new')).toBeTruthy();
  });
});
