'use client';

import { ColumnDef } from '@tanstack/react-table';
import { TagWithCount } from '@/components/admin/tags/tags-list';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { TagActions } from './tag-actions';

export const tagsColumns: ColumnDef<TagWithCount>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        aria-label="Select all"
        className="h-4 w-4 rounded border-gray-300"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(e.target.checked)}
        aria-label="Select row"
        className="h-4 w-4 rounded border-gray-300"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="font-medium max-w-[200px] truncate">
        {row.getValue('name')}
      </div>
    ),
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
    cell: ({ row }) => (
      <code className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
        {row.getValue('slug')}
      </code>
    ),
  },
  {
    accessorKey: 'count',
    header: 'Articles',
    cell: ({ row }) => {
      const count = row.getValue('count') as number;
      return (
        <Badge variant={count > 0 ? 'default' : 'secondary'} className="text-xs">
          {count}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date;
      return (
        <div className="text-muted-foreground text-sm">
          {format(new Date(date), 'MMM d, yyyy')}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <TagActions tag={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];
