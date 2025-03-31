
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createData, updateData, DataEntry } from '@/services/apiService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Column {
  key: string;
  label: string;
}

interface DataModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: DataEntry | null;
  columns: Column[];
}

export const DataModal = ({ isOpen, onClose, entry, columns }: DataModalProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isEditing = !!entry;

  const getInitialValues = () => {
    const values = columns.reduce((acc, column) => {
      acc[column.key] = entry && entry[column.key] !== undefined ? entry[column.key] : '';
      return acc;
    }, {} as Record<string, any>);

    console.log('Initial form values:', values);
    return values;
  };

  const [formValues, setFormValues] = useState<Record<string, any>>(getInitialValues());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      console.log('Modal opened, resetting form with entry:', entry);
      setFormValues(getInitialValues());
      setErrors({});
    }
  }, [isOpen, entry]);
  const createMutation = useMutation({
    mutationFn: createData,
    onSuccess: (data) => {
      console.log('Create success, new entry:', data);
      queryClient.invalidateQueries({ queryKey: ['tableData'] });

      toast({
        title: "Success",
        description: "New entry has been created successfully.",
      });

      onClose();
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast({
        title: "Error",
        description: "Failed to create entry. Please try again.",
        variant: "destructive",
      });
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DataEntry> }) =>
      updateData(id, data),
    onSuccess: (data) => {
      console.log('Update success, updated entry:', data);
      queryClient.invalidateQueries({ queryKey: ['tableData'] });

      toast({
        title: "Success",
        description: "Entry has been updated successfully.",
      });

      onClose();
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: "Failed to update entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (key: string, value: string) => {
    console.log(`Field ${key} changed to: ${value}`);
    setFormValues((prev) => ({ ...prev, [key]: value }));

    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    columns.forEach(column => {
      if (!formValues[column.key] && column.key !== 'id') {
        newErrors[column.key] = `${column.label} is required`;
      }
    });

    console.log('Form validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    console.log('Submitting form with values:', formValues);

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    if (isEditing && entry) {
      console.log(`Updating entry ${entry.id}`);
      updateMutation.mutate({
        id: entry.id,
        data: formValues
      });
    } else {
      console.log('Creating new entry');
      createMutation.mutate(formValues);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Entry' : 'Add New Entry'}</DialogTitle>
          <DialogDescription>
            Fill in the fields below to {isEditing ? 'update the' : 'create a new'} entry.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {columns.map(column => (
            column.key !== 'id' && (
              <div key={column.key} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={column.key} className="text-right">
                  {column.label}
                </Label>
                <div className="col-span-3">
                  <Input
                    id={column.key}
                    value={formValues[column.key] || ''}
                    onChange={(e) => handleInputChange(column.key, e.target.value)}
                  />
                  {errors[column.key] && (
                    <p className="text-sm text-red-500 mt-1">{errors[column.key]}</p>
                  )}
                </div>
              </div>
            )
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ?
              'Saving...' :
              isEditing ? 'Update' : 'Create'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
