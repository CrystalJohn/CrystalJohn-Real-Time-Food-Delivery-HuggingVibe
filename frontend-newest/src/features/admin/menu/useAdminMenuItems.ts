"use client";

import { useEffect, useMemo, useState } from "react";
import {
  menuAdminService,
  type AdminMenuItem,
  type CreateMenuItemRequest,
  type UpdateMenuItemRequest,
  type GetAdminMenuItemsQuery,
} from "./menu-admin.service";

export function useAdminMenuItems(initialQuery: GetAdminMenuItemsQuery = {}) {
  const [items, setItems] = useState<AdminMenuItem[]>([]);
  const [query, setQuery] = useState<GetAdminMenuItemsQuery>(initialQuery);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async (override?: GetAdminMenuItemsQuery) => {
    const q = override ?? query;
    setLoading(true);
    setError(null);
    try {
      const data = await menuAdminService.getMenuItems(q);
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.categoryId, query.keyword]);

  const create = async (dto: CreateMenuItemRequest) => {
    setSaving(true);
    try {
      await menuAdminService.createMenuItem(dto);
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  const update = async (id: number, dto: UpdateMenuItemRequest) => {
    setSaving(true);
    try {
      await menuAdminService.updateMenuItem(id, dto);
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    setSaving(true);
    try {
      await menuAdminService.deleteMenuItem(id);
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  const actions = useMemo(
    () => ({ setQuery, refetch, create, update, remove }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, items],
  );

  return { items, query, loading, saving, error, ...actions };
}
