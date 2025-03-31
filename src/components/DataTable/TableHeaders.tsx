
import { 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { TableFilters } from '@/store/tableStore';

interface Column {
  key: string;
  label: string;
}

interface TableHeadersProps {
  columns: Column[];
  filters: TableFilters;
  columnVisibility: Record<string, boolean>;
  onSortChange: (column: string) => void;
}

export const TableHeaders = ({ 
  columns, 
  filters, 
  columnVisibility, 
  onSortChange 
}: TableHeadersProps) => {
  return (
    <TableHeader>
      <TableRow>
        {columns.map((column) => (
          columnVisibility[column.key] !== false && (
            <TableHead key={column.key} className="whitespace-nowrap">
              <Button
                variant="ghost"
                onClick={() => onSortChange(column.key)}
                className="flex items-center gap-1 font-medium"
              >
                {column.label}
                {filters.sortBy === column.key && (
                  filters.sortOrder === 'asc' 
                    ? <ArrowUp className="h-4 w-4" /> 
                    : <ArrowDown className="h-4 w-4" />
                )}
              </Button>
            </TableHead>
          )
        ))}
        <TableHead className="w-[80px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
