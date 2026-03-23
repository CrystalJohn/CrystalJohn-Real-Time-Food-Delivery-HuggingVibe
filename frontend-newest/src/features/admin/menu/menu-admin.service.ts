import { api } from "@/lib/api";

export type AdminMenuCategory = {
  id: number;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  itemCount: number;
  activeItemCount: number;
};

export type AdminMenuItemImage = {
  id?: number;
  imageUrl: string;
  isThumbnail?: boolean;
  sortOrder?: number;
};

export type AdminMenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  sortOrder: number;
  isActive: boolean;
  isAvailable: boolean;
  categoryId: number;
  category?: {
    id: number;
    name: string;
    isActive?: boolean;
  };
  images?: AdminMenuItemImage[];
};

export type CreateCategoryRequest = {
  name: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;

export type GetAdminMenuItemsQuery = {
  categoryId?: number;
  keyword?: string;
};

export type CreateMenuItemRequest = {
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  sortOrder?: number;
  isActive?: boolean;
  isAvailable?: boolean;
  images?: AdminMenuItemImage[];
};

export type UpdateMenuItemRequest = Partial<CreateMenuItemRequest>;

export const menuAdminService = {
  // ==========================================
  // CRUD cho Menu Categories
  // ==========================================

  // GET /api/admin/menu/categories
  async getCategories(): Promise<AdminMenuCategory[]> {
    return api.get<AdminMenuCategory[]>("/admin/menu/categories");
  },

  // POST /api/admin/menu/categories
  async createCategory(dto: CreateCategoryRequest): Promise<AdminMenuCategory> {
    return api.post<AdminMenuCategory>("/admin/menu/categories", dto);
  },

  // PATCH /api/admin/menu/categories/{id}
  async updateCategory(
    id: number,
    dto: UpdateCategoryRequest,
  ): Promise<AdminMenuCategory> {
    return api.patch<AdminMenuCategory>(`/admin/menu/categories/${id}`, dto);
  },

  // DELETE /api/admin/menu/categories/{id}
  async deleteCategory(
    id: number,
  ): Promise<{ message: string; categoryId: number }> {
    return api.delete<{ message: string; categoryId: number }>(
      `/admin/menu/categories/${id}`,
    );
  },

  // ==========================================
  // CRUD cho Menu Items
  // ==========================================
  
  // GET /api/admin/menu/items
  async getMenuItems(
    query: GetAdminMenuItemsQuery = {},
  ): Promise<AdminMenuItem[]> {
    const params = new URLSearchParams();
    if (query.categoryId) params.set("categoryId", String(query.categoryId));
    if (query.keyword?.trim()) params.set("keyword", query.keyword.trim());
    const qs = params.toString();
    return api.get<AdminMenuItem[]>(`/admin/menu/items${qs ? `?${qs}` : ""}`);
  },

  async getMenuItemDetail(id: number): Promise<AdminMenuItem> {
    return api.get<AdminMenuItem>(`/admin/menu/items/${id}`);
  },

  async createMenuItem(dto: CreateMenuItemRequest): Promise<AdminMenuItem> {
    return api.post<AdminMenuItem>("/admin/menu/items", dto);
  },

  async updateMenuItem(
    id: number,
    dto: UpdateMenuItemRequest,
  ): Promise<AdminMenuItem> {
    return api.patch<AdminMenuItem>(`/admin/menu/items/${id}`, dto);
  },

  async deleteMenuItem(
    id: number,
  ): Promise<{ message: string; menuItemId: number }> {
    return api.delete<{ message: string; menuItemId: number }>(
      `/admin/menu/items/${id}`,
    );
  },
};
