import { api } from '@/lib/api';
import type { MenuItem } from '@/types';

export const staffMenuService = {
  async getAll(): Promise<MenuItem[]> {
    return api.get<MenuItem[]>('/staff/menu-items');
  },

  async updateAvailability(id: string | number, isAvailable: boolean): Promise<MenuItem> {
    return api.patch<MenuItem>(`/staff/menu-items/${id}/availability`, {
      isAvailable,
    });
  },
};