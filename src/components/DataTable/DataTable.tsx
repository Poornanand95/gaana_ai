
import { useState } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import {
  fetchData,
  deleteData,
  DataEntry
} from '@/services/apiService';
import { useTableStore } from '@/store/tableStore';
import { DataTableHeader } from './DataTableHeader';
import { DataTablePagination } from './DataTablePagination';
import { Table } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { DataModal } from './DataModal';
import { TableHeaders } from './TableHeaders';
import { TableContent } from './TableContent';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

interface Column {
  key: string;
  label: string;
}

interface DataTableProps {
  columns: Column[];
}

export const DataTable = ({ columns }: DataTableProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { filters, setFilters, columnVisibility } = useTableStore();

  const [editingEntry, setEditingEntry] = useState<DataEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    data: queryData,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['tableData', filters],
    queryFn: () => fetchData(filters),
    retry: 1,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteData,
    onMutate: () => {
      setIsDeleting(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tableData'] });

      toast({
        title: "Entry deleted",
        description: "The entry has been successfully deleted.",
      });

      setIsDeleteDialogOpen(false);
      setEntryToDelete(null);
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete the entry. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsDeleting(false);
      setTimeout(() => {
        refetch();
      }, 100);
    }
  });

  const handleSortChange = (column: string) => {
    const isCurrentSortColumn = filters.sortBy === column;

    setFilters({
      sortBy: column,
      sortOrder: isCurrentSortColumn && filters.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  const handleEdit = (entry: DataEntry) => {
    console.log('Editing entry:', entry);
    setEditingEntry({ ...entry });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    console.log('Preparing to delete entry:', id);
    setEntryToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (entryToDelete !== null && !isDeleting) {
      console.log('Confirming deletion of entry:', entryToDelete);
      deleteMutation.mutate(entryToDelete);
    }
  };

  const handleAddNew = () => {
    console.log('Opening form to add new entry');
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    console.log('Closing modal');
    setIsModalOpen(false);
    setEditingEntry(null);

    setTimeout(() => {
      refetch();
    }, 100);
  };

  const handleRetry = () => {
    console.log('Retrying data fetch');
    refetch();
  };

  return (
    <div className="space-y-4">
      <DataTableHeader
        columns={columns}
        onAddNew={handleAddNew}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeaders
            columns={columns}
            filters={filters}
            columnVisibility={columnVisibility}
            onSortChange={handleSortChange}
          />
          <TableContent
            isLoading={isLoading}
            isError={isError}
            data={queryData}
            columns={columns}
            columnVisibility={columnVisibility}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRetry={handleRetry}
          />
        </Table>
      </div>

      {queryData && queryData.total > 0 && (
        <DataTablePagination total={queryData.total} />
      )}

      <DataModal
        isOpen={isModalOpen}
        onClose={closeModal}
        entry={editingEntry}
        columns={columns}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
