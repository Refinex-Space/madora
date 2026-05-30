import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Home from '@/app/page';

vi.mock('@/components/workspace/workspace-layout', () => ({
  WorkspaceLayout: () => <main>打开一个 Markdown 工作区</main>,
}));

describe('root page', () => {
  it('renders the workspace shell as the application entry', () => {
    render(<Home />);

    expect(screen.getByText('打开一个 Markdown 工作区')).toBeTruthy();
    expect(screen.queryByText('To get started, edit the page.tsx file.')).toBeNull();
  });
});
