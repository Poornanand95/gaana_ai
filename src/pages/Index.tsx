
import { DataTable } from '@/components/DataTable';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'department', label: 'Department' },
  { key: 'status', label: 'Status' }
];

const Index = () => {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Data Table</h1>
      <p className="text-muted-foreground mb-8">
        A feature-rich data table with sorting, filtering, pagination and CRUD operations.
      </p>

      <DataTable columns={columns} />

      <div className="mt-12 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-medium mb-2">How to use</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Use the search box to filter data across all fields</li>
          <li>Click column headers to sort data</li>
          <li>Use the "Columns" button to show/hide columns</li>
          <li>Click "Add New" to create a new entry</li>
          <li>Use the actions menu (three dots) to edit or delete an entry</li>
        </ol>
      </div>
    </div>
  );
};

export default Index;
