
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useTableStore } from '@/store/tableStore';

interface DataTablePaginationProps {
  total: number;
}

export const DataTablePagination = ({ total }: DataTablePaginationProps) => {
  const { filters, setFilters } = useTableStore();
  const { page, limit } = filters;

  const totalPages = Math.ceil(total / limit);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const canGoBack = page > 1;
  const canGoForward = page < totalPages;

  const goToPage = (newPage: number) => {
    setFilters({ page: newPage });
  };

  const changeLimit = (newLimit: string) => {
    setFilters({
      limit: parseInt(newLimit, 10),
      page: 1 // Reset to first page when changing items per page
    });
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Showing {Math.min((page - 1) * limit + 1, total)} to {Math.min(page * limit, total)} of {total} entries
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 mr-4">
          <span className="text-sm">Rows per page:</span>
          <Select
            value={limit.toString()}
            onValueChange={changeLimit}
          >
            <SelectTrigger className="h-8 w-16">
              <SelectValue placeholder={limit.toString()} />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50, 100].map(value => (
                <SelectItem key={value} value={value.toString()}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(1)}
            disabled={!canGoBack}
            className="h-8 w-8"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(page - 1)}
            disabled={!canGoBack}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pageNumbers.length <= 5 ? (
            pageNumbers.map(num => (
              <Button
                key={num}
                variant={num === page ? "default" : "outline"}
                size="icon"
                onClick={() => goToPage(num)}
                className="h-8 w-8"
              >
                {num}
              </Button>
            ))
          ) : (
            <>
              {page > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(1)}
                  className="h-8 w-8"
                >
                  1
                </Button>
              )}

              {page > 2 && <span className="px-1">...</span>}

              <Button
                variant="default"
                size="icon"
                className="h-8 w-8"
              >
                {page}
              </Button>

              {page < totalPages - 1 && <span className="px-1">...</span>}

              {page < totalPages && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(totalPages)}
                  className="h-8 w-8"
                >
                  {totalPages}
                </Button>
              )}
            </>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(page + 1)}
            disabled={!canGoForward}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(totalPages)}
            disabled={!canGoForward}
            className="h-8 w-8"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
