"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Input,
  Label,
} from "@/components/ui";
import { useAdminCategories } from "./useAdminCategories";
import type { AdminMenuCategory } from "./menu-admin.service";

type FormState = {
  name: string;
  description: string;
  sortOrder: string;
  isActive: boolean;
};

const EMPTY: FormState = {
  name: "",
  description: "",
  sortOrder: "0",
  isActive: true,
};

export function CategoryManagementPage() {
  const { items, loading, saving, create, update, remove } =
    useAdminCategories();

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState<AdminMenuCategory | null>(null);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [keyword, setKeyword] = useState("");

  const sorted = useMemo(() => {
    let result = items;
    if (keyword.trim()) {
      const lower = keyword.trim().toLowerCase();
      result = items.filter(
        (cat) =>
          cat.name.toLowerCase().includes(lower) ||
          (cat.description && cat.description.toLowerCase().includes(lower))
      );
    }
    return result.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
  }, [items, keyword]);

  const openCreateDialog = () => {
    setForm(EMPTY);
    setOpenCreate(true);
  };

  const openEditDialog = (cat: AdminMenuCategory) => {
    setSelected(cat);
    setForm({
      name: cat.name,
      description: cat.description ?? "",
      sortOrder: String(cat.sortOrder ?? 0),
      isActive: cat.isActive,
    });
    setOpenEdit(true);
  };

  const submitCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await create({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      });
      toast.success("Category created successfully");
      setOpenCreate(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create category");
    }
  };

  const submitEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    try {
      await update(selected.id, {
        name: form.name.trim(),
        description: form.description.trim(),
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      });
      toast.success("Category updated successfully");
      setOpenEdit(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update category",
      );
    }
  };

  const doDelete = async (cat: AdminMenuCategory) => {
    if (!confirm(`Soft delete category "${cat.name}"?`)) return;
    try {
      await remove(cat.id);
      toast.success("Category deleted successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-4xl font-bold leading-tight text-slate-800">
            Manage Menu Categories
          </h2>
          <p className="mt-2 text-lg text-slate-500">
            Manage all menu categories in the system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={openCreateDialog}
            className="h-11 rounded-2xl bg-[#f97316] px-6 text-base font-semibold text-white hover:bg-[#ea580c]"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span>Add Category</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative w-full md:max-w-[400px]">
          <Label htmlFor="search-categories" className="sr-only">Search categories</Label>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <Input 
            id="search-categories"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by name or description..."
            className="h-11 w-full rounded-2xl border-[#d2d6dd] bg-white pl-10 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Loading categories...</div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#d8dbe2] bg-white shadow-sm">
          <div className="max-h-[56vh] overflow-auto">
            <table className="min-w-[1020px] w-full text-left text-sm">
              <caption className="sr-only">List of menu categories</caption>
              <thead className="sticky top-0 z-10 bg-[#f6f7f9] text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-4 font-semibold">ID</th>
                  <th scope="col" className="px-4 py-4 font-semibold">Name & Description</th>
                  <th scope="col" className="px-4 py-4 font-semibold">Sort</th>
                  <th scope="col" className="px-4 py-4 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-4 font-semibold">Items (Active/Total)</th>
                  <th scope="col" className="px-4 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((cat) => (
                  <tr key={cat.id} className="border-t border-[#eef0f4] hover:bg-[#fafbfc] transition-colors">
                    <td className="px-4 py-4 text-slate-700 font-medium">{cat.id}</td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">
                        {cat.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {cat.description ?? "-"}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{cat.sortOrder}</td>
                    <td className="px-4 py-4">
                      {cat.isActive ? (
                        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Active</span>
                      ) : (
                         <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      <span className="font-semibold">{cat.activeItemCount}</span> / {cat.itemCount}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditDialog(cat)}
                          disabled={saving}
                          className="rounded-md p-1.5 text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label={`Edit ${cat.name}`}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => doDelete(cat)}
                          disabled={saving}
                          className="rounded-md p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-500"
                          aria-label={`Delete ${cat.name}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sorted.length === 0 && (
                  <tr>
                    <td className="p-10 text-center text-slate-500" colSpan={6}>
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-[425px] border-[#d9dce3] bg-white text-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>Add a new menu category.</DialogDescription>
          </DialogHeader>

          <form onSubmit={submitCreate} className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Sort order</Label>
              <Input
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((p) => ({ ...p, sortOrder: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isActive: e.target.checked }))
                }
              />
              <span className="text-sm">Active</span>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenCreate(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                className="rounded-xl bg-[#f97316] text-white hover:bg-[#ea580c]"
              >
                {saving ? "Saving..." : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[425px] border-[#d9dce3] bg-white text-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update the details of this category.</DialogDescription>
          </DialogHeader>

          <form onSubmit={submitEdit} className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Sort order</Label>
              <Input
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((p) => ({ ...p, sortOrder: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isActive: e.target.checked }))
                }
              />
              <span className="text-sm">Active</span>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenEdit(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saving || !selected}
                className="rounded-xl bg-[#f97316] text-white hover:bg-[#ea580c]"
              >
                {saving ? "Saving..." : "Update Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
