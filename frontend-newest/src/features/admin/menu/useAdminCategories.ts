"use client";

import { useEffect, useState } from "react";
import {
  menuAdminService,
  type AdminMenuCategory,
  type CreateCategoryRequest,
  type UpdateCategoryRequest,
} from "./menu-admin.service";

export function useAdminCategories() {
  const [items, setItems] = useState<AdminMenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await menuAdminService.getCategories();
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refetch();
  }, []);

  const create = async (dto: CreateCategoryRequest) => {
    setSaving(true);
    try {
      await menuAdminService.createCategory(dto);
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  const update = async (id: number, dto: UpdateCategoryRequest) => {
    setSaving(true);
    try {
      await menuAdminService.updateCategory(id, dto);
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    setSaving(true);
    try {
      await menuAdminService.deleteCategory(id);
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  return { items, loading, saving, error, refetch, create, update, remove };
}
