'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import type { MenuItem } from '@/types';
import { staffMenuService } from './staff-menu.service';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200';

export function StaffMenuPanel() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'SOLD_OUT'>('ALL');
  const [updatingIds, setUpdatingIds] = useState<Array<string | number>>([]);

  useEffect(() => {
    let ignore = false;

    const loadMenu = async () => {
      try {
        const data = await staffMenuService.getAll();
        if (!ignore) {
          setItems(data);
        }
      } catch (error) {
        console.error('Load staff menu failed', error);
        toast.error('Không tải được danh sách món cho staff.');
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void loadMenu();

    return () => {
      ignore = true;
    };
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(items.map((item) => item.category).filter(Boolean)));
    return ['ALL', ...unique];
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return items.filter((item) => {
      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        item.name.toLowerCase().includes(normalizedKeyword) ||
        item.category.toLowerCase().includes(normalizedKeyword) ||
        (item.description || '').toLowerCase().includes(normalizedKeyword);

      const matchesCategory =
        categoryFilter === 'ALL' || item.category === categoryFilter;

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'AVAILABLE' && item.available) ||
        (statusFilter === 'SOLD_OUT' && !item.available);

      return matchesKeyword && matchesCategory && matchesStatus;
    });
  }, [items, keyword, categoryFilter, statusFilter]);

  const summary = useMemo(() => {
    const total = items.length;
    const available = items.filter((item) => item.available).length;
    const soldOut = total - available;
    return { total, available, soldOut };
  }, [items]);

  const handleToggleAvailability = async (item: MenuItem) => {
    if (updatingIds.includes(item.id)) return;

    setUpdatingIds((prev) => [...prev, item.id]);

    try {
      await staffMenuService.updateAvailability(item.id, !item.available);

      setItems((prev) =>
        prev.map((current) =>
          current.id === item.id
            ? { ...current, available: !current.available }
            : current,
        ),
      );

      toast.success(
        !item.available
          ? `Đã chuyển "${item.name}" sang Available.`
          : `Đã chuyển "${item.name}" sang Sold Out.`,
      );
    } catch (error) {
      console.error('Toggle availability failed', error);
      toast.error(`Không cập nhật được trạng thái của "${item.name}".`);
    } finally {
      setUpdatingIds((prev) => prev.filter((id) => id !== item.id));
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Đang tải menu cho staff...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Items</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{summary.total}</p>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
          <p className="text-sm text-green-700">Available</p>
          <p className="mt-2 text-3xl font-bold text-green-700">{summary.available}</p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <p className="text-sm text-red-700">Sold Out</p>
          <p className="mt-2 text-3xl font-bold text-red-700">{summary.soldOut}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-3">
          <input
            type="text"
            placeholder="Tìm theo tên món, category, mô tả..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'ALL' ? 'Tất cả category' : category}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'ALL' | 'AVAILABLE' | 'SOLD_OUT')
            }
            className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="AVAILABLE">Available</option>
            <option value="SOLD_OUT">Sold Out</option>
          </select>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-800">Không có món nào phù hợp</p>
          <p className="mt-2 text-sm text-gray-500">
            Hãy đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredItems.map((item) => {
            const isUpdating = updatingIds.includes(item.id);

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row">
                  <img
                    src={item.imageUrl || FALLBACK_IMAGE}
                    alt={item.name}
                    className="h-28 w-full rounded-xl object-cover sm:w-36"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold text-gray-900">{item.name}</p>
                        <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.available
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.available ? 'AVAILABLE' : 'SOLD OUT'}
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                      {item.description || 'Không có mô tả.'}
                    </p>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-lg font-bold text-red-600">
                        {item.price.toLocaleString('vi-VN')} VND
                      </p>

                      <button
                        type="button"
                        onClick={() => void handleToggleAvailability(item)}
                        disabled={isUpdating}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                          item.available
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        } disabled:opacity-50`}
                      >
                        {isUpdating
                          ? 'Đang cập nhật...'
                          : item.available
                            ? 'Mark Sold Out'
                            : 'Mark Available'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}