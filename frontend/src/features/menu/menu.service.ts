import { api } from '@/lib/api';
import type { MenuItem } from '@/types';

export const menuService = {
  async getAll(): Promise<MenuItem[]> {
    return api.get<MenuItem[]>('/menu');
  },

  async getById(id: string): Promise<MenuItem> {
    return api.get<MenuItem>(`/menu/${id}`);
  },

  async getByCategory(category: string): Promise<MenuItem[]> {
    return api.get<MenuItem[]>(`/menu?category=${category}`);
  },
};
