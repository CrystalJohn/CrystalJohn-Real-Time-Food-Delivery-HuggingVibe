'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { Pencil, Plus, Search, Trash2, ImageOff, Settings2 } from 'lucide-react';
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, Input, Label } from '@/components/ui';
import { useAdminCategories } from './useAdminCategories';
import type { AdminMenuCategory } from './menu-admin.service';
import { useAdminMenuItems } from './useAdminMenuItems';
import type { AdminMenuItem } from './menu-admin.service';

type FormState = {
  categoryId: string;
  name: string;
  description: string;
  price: string;
  sortOrder: string;
  isActive: boolean;
  isAvailable: boolean;
  thumbnailUrl: string;
};

const EMPTY: FormState = {
  categoryId: '',
  name: '',
  description: '',
  price: '',
  sortOrder: '0',
  isActive: true,
  isAvailable: true,
  thumbnailUrl: '',
};

function pickThumbnail(item: AdminMenuItem): string {
  const thumb = item.images?.find((x) => x.isThumbnail)?.imageUrl;
  return thumb || item.images?.[0]?.imageUrl || '';
}

export function MenuItemManagementPage() {
  const categories = useAdminCategories();
  const menuItems = useAdminMenuItems();

  const [keyword, setKeyword] = useState('');
  const [catFilter, setCatFilter] = useState<string>('');

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openEditCategory, setOpenEditCategory] = useState(false);
  const [selected, setSelected] = useState<AdminMenuItem | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [catEditForm, setCatEditForm] = useState({ name: '', description: '', sortOrder: '0', isActive: true });

  const categoryOptions = useMemo(() => categories.items, [categories.items]);

  const applyFilter = () => {
    menuItems.setQuery({
      keyword: keyword.trim() || undefined,
      categoryId: catFilter ? Number(catFilter) : undefined,
    });
  };

  const openCreateDialog = () => {
    setForm({
      ...EMPTY,
      categoryId: catFilter || '',
    });
    setOpenCreate(true);
  };

  const openEditDialog = (item: AdminMenuItem) => {
    setSelected(item);
    setForm({
      categoryId: String(item.categoryId),
      name: item.name,
      description: item.description ?? '',
      price: String(item.price),
      sortOrder: String(item.sortOrder ?? 0),
      isActive: item.isActive,
      isAvailable: item.isAvailable,
      thumbnailUrl: pickThumbnail(item),
    });
    setOpenEdit(true);
  };

  const submitCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await menuItems.create({
        categoryId: Number(form.categoryId),
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price),
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
        isAvailable: form.isAvailable,
        images: form.thumbnailUrl.trim()
          ? [{ imageUrl: form.thumbnailUrl.trim(), isThumbnail: true, sortOrder: 0 }]
          : [],
      });

      toast.success('Successfully created menu item');
      setOpenCreate(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create menu item');
    }
  };

  const submitEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    try {
      await menuItems.update(selected.id, {
        categoryId: Number(form.categoryId),
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
        isAvailable: form.isAvailable,
        images: form.thumbnailUrl.trim()
          ? [{ imageUrl: form.thumbnailUrl.trim(), isThumbnail: true, sortOrder: 0 }]
          : [],
      });

      toast.success('Successfully updated menu item');
      setOpenEdit(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update menu item');
    }
  };

  const submitEditCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!catFilter) return;
    try {
      await categories.update(Number(catFilter), {
        name: catEditForm.name.trim(),
        description: catEditForm.description.trim() || undefined,
        sortOrder: Number(catEditForm.sortOrder) || 0,
        isActive: catEditForm.isActive,
      });
      toast.success('Successfully updated category');
      setOpenEditCategory(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update category');
    }
  };

  const doDelete = async (item: AdminMenuItem) => {
    if (!confirm(`Soft delete item "${item.name}"?`)) return;
    try {
      await menuItems.remove(item.id);
      toast.success('Successfully deleted menu item');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-4xl font-bold leading-tight text-slate-800">Manage Menu Items</h2>
          <p className="mt-2 text-lg text-slate-500">
            Manage all menu items in the system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/menu/categories">
            <Button type="button" variant="outline" className="h-11 rounded-2xl px-6 text-base font-semibold">
              Categories
            </Button>
          </Link>
          <Button
            type="button"
            onClick={openCreateDialog}
            className="h-11 rounded-2xl bg-[#f97316] px-6 text-base font-semibold text-white hover:bg-[#ea580c]"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span>Add Menu Item</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative w-full md:max-w-[320px]">
          <Label htmlFor="search-items" className="sr-only">Search items</Label>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <Input 
            id="search-items"
            value={keyword} 
            onChange={(e) => setKeyword(e.target.value)} 
            placeholder="Search by name/description..." 
            className="h-11 w-full rounded-2xl border-[#d2d6dd] bg-white pl-10 text-sm"
          />
        </div>

        <div className="w-full md:w-auto flex items-end gap-2">
          <div className="w-full md:w-64">
            <Label htmlFor="category-filter" className="sr-only">Filter by category</Label>
            <select
              id="category-filter"
              className="h-11 w-full rounded-2xl border border-[#d2d6dd] bg-white px-4 text-sm focus:border-[#f97316] focus:outline-none focus:ring-1 focus:ring-[#f97316]"
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categoryOptions.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name} {c.isActive ? '' : '(inactive)'}
                </option>
              ))}
            </select>
          </div>
          {catFilter && (
            <Button
              type="button"
              variant="outline"
              className="h-11 px-3 rounded-2xl"
              onClick={() => {
                const cat = categories.items.find(c => String(c.id) === catFilter);
                if (cat) {
                  setCatEditForm({
                    name: cat.name,
                    description: cat.description ?? '',
                    sortOrder: String(cat.sortOrder ?? 0),
                    isActive: cat.isActive,
                  });
                  setOpenEditCategory(true);
                }
              }}
              title="Quick Edit Selected Category"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Button 
          type="button"
          onClick={applyFilter} 
          disabled={menuItems.loading}
          className="h-11 rounded-2xl px-6 font-semibold"
          variant="secondary"
        >
          Apply Filters
        </Button>
      </div>

      {/* Table */}
      {menuItems.loading ? (
        <div className="text-center py-10 text-slate-500">Loading...</div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#d8dbe2] bg-white shadow-sm">
          <div className="max-h-[56vh] overflow-auto">
            <table className="min-w-[1020px] w-full text-left text-sm">
              <caption className="sr-only">List of menu items</caption>
              <thead className="sticky top-0 z-10 bg-[#f6f7f9] text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-4 font-semibold">Image</th>
                  <th scope="col" className="px-4 py-4 font-semibold">Name</th>
                  <th scope="col" className="px-4 py-4 font-semibold">Category</th>
                  <th scope="col" className="px-4 py-4 font-semibold text-right">Price</th>
                  <th scope="col" className="px-4 py-4 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-4 font-semibold">Availability</th>
                  <th scope="col" className="px-4 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.items.map((it) => {
                  const thumb = pickThumbnail(it);
                  return (
                  <tr key={it.id} className="border-t border-[#eef0f4] hover:bg-[#fafbfc] transition-colors">
                    <td className="px-4 py-4">
                      {thumb ? (
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-slate-100">
                          <Image 
                            src={thumb} 
                            alt={`Thumbnail for ${it.name}`} 
                            fill 
                            className="object-cover" 
                            sizes="48px" 
                            unoptimized 
                          />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-400" aria-label="No image available">
                          <ImageOff className="h-5 w-5" aria-hidden="true" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">{it.name}</div>
                      <div className="text-xs text-slate-500 max-w-xs truncate">{it.description ?? '-'}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{it.category?.name ?? it.categoryId}</td>
                    <td className="px-4 py-4 text-right font-medium text-slate-700">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(it.price / 100)}
                    </td>
                    <td className="px-4 py-4">
                      {it.isActive ? (
                        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Active</span>
                      ) : (
                         <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                       {it.isAvailable ? (
                        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Available</span>
                      ) : (
                         <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">Sold Out</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditDialog(it)}
                          disabled={menuItems.saving}
                          className="rounded-md p-1.5 text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label={`Edit ${it.name}`}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                           type="button"
                           onClick={() => doDelete(it)}
                           disabled={menuItems.saving}
                           className="rounded-md p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-500"
                           aria-label={`Delete ${it.name}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
                {menuItems.items.length === 0 && (
                  <tr>
                    <td className="border-t border-[#eef0f4] p-10 text-center text-slate-500" colSpan={7}>
                      No menu items found.
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
        <DialogContent className="sm:max-w-[600px] border-[#d9dce3] bg-white text-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Create Menu Item</DialogTitle>
            <DialogDescription>Add a new item to your menu.</DialogDescription>
          </DialogHeader>

          <form onSubmit={submitCreate} className="space-y-3">
            <div>
              <Label>Category</Label>
              <select
                className="w-full h-10 border border-gray-200 rounded-md px-3 text-sm"
                value={form.categoryId}
                onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
              >
                <option value="">-- select --</option>
                {categoryOptions.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name} {c.isActive ? '' : '(inactive)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
            </div>

            <div>
              <Label>Price</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
            </div>

            <div>
              <Label>Sort order</Label>
              <Input type="number" value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))} />
            </div>

            <div>
              <Label>Thumbnail URL</Label>
              <Input
                value={form.thumbnailUrl}
                onChange={(e) => setForm((p) => ({ ...p, thumbnailUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                />
                Active
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(e) => setForm((p) => ({ ...p, isAvailable: e.target.checked }))}
                />
                Available
              </label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={menuItems.saving} className="bg-[#f97316] text-white hover:bg-[#ea580c]">
                {menuItems.saving ? 'Saving...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[600px] border-[#d9dce3] bg-white text-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>Update the details of this item.</DialogDescription>
          </DialogHeader>

          <form onSubmit={submitEdit} className="space-y-3">
            <div>
              <Label>Category</Label>
              <select
                className="w-full h-10 border border-gray-200 rounded-md px-3 text-sm"
                value={form.categoryId}
                onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
              >
                <option value="">-- select --</option>
                {categoryOptions.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name} {c.isActive ? '' : '(inactive)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
            </div>

            <div>
              <Label>Price</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
            </div>

            <div>
              <Label>Sort order</Label>
              <Input type="number" value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))} />
            </div>

            <div>
              <Label>Thumbnail URL</Label>
              <Input
                value={form.thumbnailUrl}
                onChange={(e) => setForm((p) => ({ ...p, thumbnailUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                />
                Active
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(e) => setForm((p) => ({ ...p, isAvailable: e.target.checked }))}
                />
                Available
              </label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenEdit(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={menuItems.saving || !selected} className="bg-[#f97316] text-white hover:bg-[#ea580c]">
                {menuItems.saving ? 'Saving...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Quick View */}
      <Dialog open={openEditCategory} onOpenChange={setOpenEditCategory}>
        <DialogContent className="sm:max-w-[425px] border-[#d9dce3] bg-white text-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Quick Edit Category</DialogTitle>
            <DialogDescription>Update the details of the selected category directly from here.</DialogDescription>
          </DialogHeader>

          <form onSubmit={submitEditCategory} className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={catEditForm.name}
                onChange={(e) => setCatEditForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={catEditForm.description}
                onChange={(e) => setCatEditForm((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div>
              <Label>Sort order</Label>
              <Input
                type="number"
                value={catEditForm.sortOrder}
                onChange={(e) => setCatEditForm((p) => ({ ...p, sortOrder: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={catEditForm.isActive}
                onChange={(e) => setCatEditForm((p) => ({ ...p, isActive: e.target.checked }))}
              />
              <span className="text-sm">Active</span>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setOpenEditCategory(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={categories.saving} className="bg-[#f97316] text-white hover:bg-[#ea580c]">
                {categories.saving ? "Saving..." : "Update Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}