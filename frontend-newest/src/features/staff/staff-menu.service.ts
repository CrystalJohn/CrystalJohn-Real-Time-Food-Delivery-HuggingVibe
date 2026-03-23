import { api } from '@/lib/api';
import type { MenuItem } from '@/types';

/** Shape returned by GET /api/staff/menu-items */
interface StaffMenuItemRaw {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  isActive: boolean;
  sortOrder: number;
  images: { id: number; imageUrl: string; isThumbnail: boolean; sortOrder: number }[];
}

function mapRawToMenuItem(raw: StaffMenuItemRaw): MenuItem {
  const thumbnail = raw.images?.find((img) => img.isThumbnail) ?? raw.images?.[0];
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    price: raw.price,
    imageUrl: thumbnail?.imageUrl ?? '',
    category: raw.categoryName,
    available: raw.isAvailable,
  };
}

export const staffMenuService = {
  async getAll(): Promise<MenuItem[]> {
    const rawItems = await api.get<StaffMenuItemRaw[]>('/staff/menu-items');
    return rawItems.map(mapRawToMenuItem);
  },

  async updateAvailability(id: string | number, isAvailable: boolean): Promise<MenuItem> {
    const raw = await api.patch<StaffMenuItemRaw>(`/staff/menu-items/${id}/availability`, {
      isAvailable,
    });
    return mapRawToMenuItem(raw);
  },
};