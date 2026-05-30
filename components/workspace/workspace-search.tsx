import { Search } from 'lucide-react';

interface WorkspaceSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function WorkspaceSearch({ value, onChange }: WorkspaceSearchProps) {
  return (
    <label className="flex h-9 items-center gap-2 rounded-md border bg-background px-2 text-sm">
      <Search className="text-muted-foreground" size={15} />
      <input
        className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        placeholder="搜索标题或路径"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
