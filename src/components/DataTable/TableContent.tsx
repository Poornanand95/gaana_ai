
import { DataEntry } from '@/services/apiService';
import { 
  TableBody, 
  TableCell, 
  TableRow 
} from '@/components/ui/table';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableActions } from './TableActions';

interface Column {
  key: string;
  label: string;
}

interface TableContentProps {
  isLoading: boolean;
  isError: boolean;
  data: { data: DataEntry[], total: number } | undefined;
  columns: Column[];
  columnVisibility: Record<string, boolean>;
  onEdit: (entry: DataEntry) => void;
  onDelete: (id: number) => void;
  onRetry: () => void;
}

export const TableContent = ({ 
  isLoading, 
  isError, 
  data, 
  columns, 
  columnVisibility,
  onEdit,
  onDelete,
  onRetry
}: TableContentProps) => {
  
  if (isLoading) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={columns.length + 1} className="h-24 text-center">
            <div className="flex justify-center items-center">
              <RefreshCcw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading data...</span>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }
  
  if (isError) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={columns.length + 1} className="h-24 text-center">
            <div className="flex flex-col items-center gap-2">
              <p className="text-red-500">Error loading data.</p>
              <Button onClick={onRetry} variant="outline" size="sm" className="mt-2">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }
  
  if (!data || data.data.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={columns.length + 1} className="h-24 text-center">
            No results found.
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }
  
  return (
    <TableBody>
      {data.data.map((entry) => (
        <TableRow key={entry.id}>
          {columns.map((column) => (
            columnVisibility[column.key] !== false && (
              <TableCell key={`${entry.id}-${column.key}`}>
                {entry[column.key]}
              </TableCell>
            )
          ))}
          <TableCell>
            <TableActions 
              entry={entry} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
};
