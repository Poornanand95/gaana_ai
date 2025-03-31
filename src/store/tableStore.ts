
import { create } from 'zustand';

export interface TableFilters {
  search: string;
  sortBy: string | null;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface ColumnVisibility {
  [key: string]: boolean;
}

interface TableStore {
  filters: TableFilters;
  columnVisibility: ColumnVisibility;
  setFilters: (filters: Partial<TableFilters>) => void;
  resetFilters: () => void;
  toggleColumnVisibility: (column: string) => void;
  setColumnVisibility: (columns: ColumnVisibility) => void;
}

const DEFAULT_FILTERS: TableFilters = {
  search: '',
  sortBy: null,
  sortOrder: 'asc',
  page: 1,
  limit: 20,
};

export const useTableStore = create<TableStore>((set) => ({
  filters: DEFAULT_FILTERS,
  columnVisibility: {},

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    })),

  resetFilters: () =>
    set({ filters: DEFAULT_FILTERS }),

  toggleColumnVisibility: (column) =>
    set((state) => ({
      columnVisibility: {
        ...state.columnVisibility,
        [column]: !state.columnVisibility[column]
      }
    })),

  setColumnVisibility: (columns) =>
    set({ columnVisibility: columns }),
}));
