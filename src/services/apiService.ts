
import axios from 'axios';
import { TableFilters } from '@/store/tableStore';

const API_URL = import.meta.env.VITE_API_URL || 'https://jsonplaceholder.typicode.com';

export interface DataEntry {
  id: number;
  [key: string]: any;
}

const getLocalCache = (): DataEntry[] => {
  const cachedData = window.localStorage.getItem('mockDataCache');
  return cachedData ? JSON.parse(cachedData) : [];
};

const setLocalCache = (data: DataEntry[]): void => {
  window.localStorage.setItem('mockDataCache', JSON.stringify(data));
};

const getNextId = (apiData: DataEntry[]): number => {
  const mockData = getLocalCache();
  const highestMockId = mockData.length > 0
    ? Math.max(...mockData.map(item => item.id))
    : 0;
  const highestApiId = apiData.length > 0
    ? Math.max(...apiData.map(item => item.id))
    : 0;

  return Math.max(highestMockId, highestApiId) + 1;
};

export async function fetchData(filters: TableFilters): Promise<{ data: DataEntry[], total: number }> {
  try {
    console.log('Fetching data with filters:', filters);
    const params = new URLSearchParams();
    params.append('_page', filters.page.toString());
    params.append('_limit', filters.limit.toString());
    if (filters.sortBy) {
      params.append('_sort', filters.sortBy);
      params.append('_order', filters.sortOrder);
    }
    if (filters.search) {
      params.append('q', filters.search);
    }

    console.log('API request URL:', `${API_URL}/users?${params.toString()}`);

    const response = await axios.get(`${API_URL}/users`, {
      params,
      headers: {
        'Accept': 'application/json'
      }
    });
    const total = parseInt(response.headers['x-total-count'] || response.data.length.toString(), 10);

    const transformedData = response.data.map((item: any) => {
      return {
        id: item.id,
        name: item.name || item.username || 'Unknown',
        email: item.email || 'email@example.com',
        role: item.role || 'User',
        department: item.department || item.company?.name || 'General',
        status: item.status || 'Active'
      };
    });

    const mockData = getLocalCache();

    const apiIds = new Set(transformedData.map((item: DataEntry) => item.id));
    const mockIds = new Set(mockData.map((item: DataEntry) => item.id));
    const deletedIds = new Set(
      JSON.parse(window.localStorage.getItem('deletedEntryIds') || '[]')
    );

    let mergedData: DataEntry[] = [];

    transformedData.forEach(item => {
      if (!deletedIds.has(item.id)) {
        const cachedVersion = mockData.find(mItem => mItem.id === item.id);
        if (cachedVersion) {
          mergedData.push(cachedVersion);
        } else {
          mergedData.push(item);
        }
      }
    });

    mockData.forEach(item => {
      if (!apiIds.has(item.id) && !deletedIds.has(item.id)) {
        mergedData.push(item);
      }
    });

    mergedData.sort((a, b) => a.id - b.id);

    const startIndex = (filters.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    const paginatedData = mergedData.slice(startIndex, endIndex);

    console.log('Merged data:', mergedData);
    console.log('Paginated data:', paginatedData);
    console.log('Total count (including cached):', mergedData.length);

    return {
      data: paginatedData,
      total: mergedData.length
    };
  } catch (error) {
    console.error('Error fetching data:', error);

    try {
      const mockData = getLocalCache();
      const deletedIds = new Set(
        JSON.parse(window.localStorage.getItem('deletedEntryIds') || '[]')
      );

      const filteredData = mockData.filter(item => !deletedIds.has(item.id));

      return {
        data: filteredData,
        total: filteredData.length
      };
    } catch (e) {
      console.error('Failed to read cached data:', e);
      return { data: [], total: 0 };
    }
  }
}

export async function createData(newEntry: Omit<DataEntry, 'id'>): Promise<DataEntry> {
  try {
    const entryToSend = { ...newEntry };
    if ('id' in entryToSend && !entryToSend.id) {
      delete (entryToSend as any).id;
    }
    const response = await axios.post(`${API_URL}/users`, entryToSend);
    const mockData = getLocalCache();

    const responseData = response.data;

    const createdEntry = {
      id: getNextId([responseData, ...mockData]),
      name: responseData.name || newEntry.name || '',
      email: responseData.email || newEntry.email || '',
      role: responseData.role || newEntry.role || '',
      department: responseData.department || newEntry.department || '',
      status: responseData.status || newEntry.status || ''
    };

    mockData.push(createdEntry);
    setLocalCache(mockData);

    return createdEntry;
  } catch (error) {
    console.error('Error creating data:', error);

    const mockData = getLocalCache();

    const createdEntry = {
      id: getNextId(mockData),
      ...newEntry
    } as DataEntry;

    mockData.push(createdEntry);
    setLocalCache(mockData);

    return createdEntry;
  }
}

export async function updateData(id: number, updatedEntry: Partial<DataEntry>): Promise<DataEntry> {
  try {
    let response;
    try {
      response = await axios.put(`${API_URL}/users/${id}`, updatedEntry);
    } catch (putError) {
      console.log('PUT failed, trying PATCH:', putError);
      response = await axios.patch(`${API_URL}/users/${id}`, updatedEntry);
    }
    const updatedData = {
      id,
      ...updatedEntry,
    };
    const mockData = getLocalCache();
    const existingItemIndex = mockData.findIndex((item: DataEntry) => item.id === id);

    if (existingItemIndex >= 0) {
      mockData[existingItemIndex] = {
        ...mockData[existingItemIndex],
        ...updatedEntry
      };
    } else {
      mockData.push(updatedData);
    }

    setLocalCache(mockData);

    return updatedData;
  } catch (error) {
    const updatedData = {
      id,
      ...updatedEntry
    } as DataEntry;

    const mockData = getLocalCache();
    const existingItemIndex = mockData.findIndex((item: DataEntry) => item.id === id);

    if (existingItemIndex >= 0) {
      mockData[existingItemIndex] = {
        ...mockData[existingItemIndex],
        ...updatedEntry
      };
    } else {
      mockData.push(updatedData);
    }

    setLocalCache(mockData);

    return updatedData;
  }
}

export async function deleteData(id: number): Promise<void> {
  try {
    console.log(`Deleting entry ${id}`);
    await axios.delete(`${API_URL}/users/${id}`);
    console.log(`Entry ${id} deleted successfully`);
    const deletedIds = JSON.parse(window.localStorage.getItem('deletedEntryIds') || '[]');
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      window.localStorage.setItem('deletedEntryIds', JSON.stringify(deletedIds));
    }

    const mockData = getLocalCache();
    const filteredData = mockData.filter((item: DataEntry) => item.id !== id);
    setLocalCache(filteredData);
  } catch (error) {
    console.error('Error deleting data:', error);
    console.log(`Mocked deletion of entry ${id}`);

    const deletedIds = JSON.parse(window.localStorage.getItem('deletedEntryIds') || '[]');
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      window.localStorage.setItem('deletedEntryIds', JSON.stringify(deletedIds));
    }
    const mockData = getLocalCache();
    const filteredData = mockData.filter((item: DataEntry) => item.id !== id);
    setLocalCache(filteredData);
  }
}

export async function fetchCachedData(): Promise<DataEntry[]> {
  return getLocalCache();
}
export function clearDeletedEntries(): void {
  window.localStorage.removeItem('deletedEntryIds');
}
