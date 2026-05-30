import { Toaster } from 'sonner';

import { WorkspaceLayout } from '@/components/workspace/workspace-layout';

export default function Home() {
  return (
    <>
      <WorkspaceLayout />
      <Toaster />
    </>
  );
}
