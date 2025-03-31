
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, SlidersHorizontal, Plus } from 'lucide-react';
import { useTableStore, ColumnVisibility } from '@/store/tableStore';

interface DataTableHeaderProps {
  columns: { key: string; label: string }[];
  onAddNew: () => void;
}

export const DataTableHeader = ({ columns, onAddNew }: DataTableHeaderProps) => {
  const { filters, setFilters, columnVisibility, toggleColumnVisibility } = useTableStore();
  const [searchValue, setSearchValue] = useState(filters.search);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchValue, page: 1 });
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <form onSubmit={handleSearch} className="flex w-full md:w-auto max-w-sm items-center space-x-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
          <Input
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-9"
          />
        </div>
        <Button type="submit" size="sm">Search</Button>
      </form>

      <div className="flex items-center space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Columns</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-4" align="end">
            <div className="space-y-2">
              <h4 className="font-medium">Toggle columns</h4>
              <div className="grid gap-2">
                {columns.map((column) => (
                  <div key={column.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`column-${column.key}`}
                      checked={columnVisibility[column.key] !== false}
                      onCheckedChange={() => toggleColumnVisibility(column.key)}
                    />
                    <label
                      htmlFor={`column-${column.key}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {column.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button onClick={onAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Add New</span>
        </Button>
      </div>
    </div>
  );
};
