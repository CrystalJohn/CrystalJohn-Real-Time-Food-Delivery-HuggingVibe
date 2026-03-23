'use client';

import { useMemo, useState, type FormEvent } from 'react';
import {
  Ban,
  Eye,
  Pencil,
  Plus,
  Search,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { ApiError } from '@/lib/api';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@/components/ui';
import { useStaffManagement } from './useStaffManagement';
import type { CreateStaffRequest, StaffAccount } from './staff.service';

interface CreateStaffFormState {
  email: string;
  fullName: string;
  phone: string;
  password: string;
}

interface CreateStaffFieldErrors {
  email?: string;
  fullName?: string;
  phone?: string;
  password?: string;
}

const INITIAL_FORM_STATE: CreateStaffFormState = {
  email: '',
  fullName: '',
  phone: '',
  password: '',
};

function getFirstFieldError(values?: string[]): string | undefined {
  return values && values.length > 0 ? values[0] : undefined;
}

function mapCreateStaffErrors(error: ApiError): CreateStaffFieldErrors {
  const fieldErrors: CreateStaffFieldErrors = {
    email: getFirstFieldError(error.errors?.email),
    fullName: getFirstFieldError(error.errors?.fullName ?? error.errors?.name),
    phone: getFirstFieldError(error.errors?.phone),
    password: getFirstFieldError(error.errors?.password),
  };

  if (error.statusCode === 409 && !fieldErrors.email) {
    fieldErrors.email = 'Email already exists in the system.';
  }

  return fieldErrors;
}

function getNameInitial(value: string): string {
  const normalized = value.trim();
  if (!normalized) return 'S';
  return normalized.charAt(0).toUpperCase();
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('vi-VN').format(date);
}

function mapRoleLabel(role: string): string {
  if (role === 'ADMIN') return 'Admin';
  if (role === 'STAFF') return 'Staff';
  return role;
}

function getStatusInfo(staff: StaffAccount): { label: string; className: string } {
  if (!staff.userIsActive) {
    return {
      label: 'Locked',
      className: 'bg-red-100 text-red-600',
    };
  }

  if (!staff.isActive) {
    return {
      label: 'Inactive',
      className: 'bg-slate-200 text-slate-600',
    };
  }

  return {
    label: 'Active',
    className: 'bg-emerald-100 text-emerald-700',
  };
}

function containsSearchTerm(staff: StaffAccount, searchTerm: string): boolean {
  const normalizedQuery = searchTerm.toLowerCase();
  return (
    staff.fullName.toLowerCase().includes(normalizedQuery) ||
    staff.email.toLowerCase().includes(normalizedQuery) ||
    staff.phone.toLowerCase().includes(normalizedQuery)
  );
}

export function StaffManagementPage() {
  const { staffs, loading, creating, error, createStaff, refetch } = useStaffManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffAccount | null>(null);
  const [formData, setFormData] = useState<CreateStaffFormState>(INITIAL_FORM_STATE);
  const [fieldErrors, setFieldErrors] = useState<CreateStaffFieldErrors>({});
  const [submitError, setSubmitError] = useState('');

  const filteredStaffs = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim();
    if (!normalizedSearchTerm) return staffs;
    return staffs.filter((staff) => containsSearchTerm(staff, normalizedSearchTerm));
  }, [searchTerm, staffs]);

  const openCreateDialog = () => {
    setFieldErrors({});
    setSubmitError('');
    setFormData(INITIAL_FORM_STATE);
    setIsCreateDialogOpen(true);
  };

  const closeCreateDialog = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      setFieldErrors({});
      setSubmitError('');
      setFormData(INITIAL_FORM_STATE);
    }
  };

  const handleViewStaff = (staff: StaffAccount) => {
    setSelectedStaff(staff);
    setIsDetailDialogOpen(true);
  };

  const handleUnavailableAction = () => {
    toast.info('Update/delete staff APIs are not ready. Currently supporting Read and Create.');
  };

  const validateForm = (): boolean => {
    const nextErrors: CreateStaffFieldErrors = {};
    const emailValue = formData.email.trim();
    const fullNameValue = formData.fullName.trim();
    const phoneValue = formData.phone.trim();

    if (!emailValue) {
      nextErrors.email = 'Please enter an email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      nextErrors.email = 'Invalid email format.';
    }

    if (!fullNameValue) {
      nextErrors.fullName = 'Please enter full name.';
    } else if (fullNameValue.length < 2) {
      nextErrors.fullName = 'Full name must be at least 2 characters.';
    }

    if (!phoneValue) {
      nextErrors.phone = 'Please enter a phone number.';
    } else if (!/^[0-9]{9,15}$/.test(phoneValue)) {
      nextErrors.phone = 'Phone number must be between 9 and 15 digits.';
    }

    if (!formData.password) {
      nextErrors.password = 'Please enter a password.';
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreateStaff = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    const payload: CreateStaffRequest = {
      email: formData.email.trim(),
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
    };

    try {
      await createStaff(payload);
      toast.success(`Successfully created staff account for ${payload.fullName}.`);
      closeCreateDialog(false);
    } catch (err) {
      if (err instanceof ApiError) {
        const mappedErrors = mapCreateStaffErrors(err);
        setFieldErrors(mappedErrors);
        if (!Object.values(mappedErrors).some(Boolean)) {
          setSubmitError(err.message || 'Failed to create staff account.');
        }
      } else if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError('Failed to create staff account.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-4xl font-bold leading-tight text-slate-800">Manage Staff</h2>
                </div>
                <Button
                  type="button"
                  onClick={openCreateDialog}
                  className="h-11 rounded-2xl bg-[#f97316] px-6 text-base font-semibold text-white hover:bg-[#ea580c]"
                >
                  <Plus className="h-5 w-5" />
                  <span> Add new staff</span>
                </Button>
              </div>

              <div className="mt-6 max-w-[520px]">
                <div className="relative">
                  <Label htmlFor="search-staff" className="sr-only">Search staff</Label>
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <Input
                    id="search-staff"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by name, email..."
                    className="h-11 rounded-2xl border-[#d2d6dd] bg-white pl-10 text-sm"
                  />
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-[#d8dbe2] bg-white shadow-sm">
                <div className="max-h-[56vh] overflow-auto">
                  <table className="min-w-[980px] w-full text-left text-sm">
                    <caption className="sr-only">List of staff members</caption>
                    <thead className="sticky top-0 z-10 bg-[#f6f7f9] text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th scope="col" className="px-4 py-4 font-semibold">Staff</th>
                        <th scope="col" className="px-4 py-4 font-semibold">Phone Number</th>
                        <th scope="col" className="px-4 py-4 font-semibold">Role</th>
                        <th scope="col" className="px-4 py-4 font-semibold">Status</th>
                        <th scope="col" className="px-4 py-4 font-semibold">Created At</th>
                        <th scope="col" className="px-4 py-4 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && (
                        <tr>
                          <td
                            colSpan={6}
                            className="border-t border-[#eef0f4] px-4 py-10 text-center text-slate-500"
                          >
                            Loading staff list...
                          </td>
                        </tr>
                      )}

                      {!loading && error && (
                        <tr>
                          <td
                            colSpan={6}
                            className="border-t border-[#eef0f4] px-4 py-10 text-center text-slate-500"
                          >
                            <p className="mb-3">{error}</p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                void refetch();
                              }}
                              className="rounded-xl"
                            >
                              Retry
                            </Button>
                          </td>
                        </tr>
                      )}

                      {!loading && !error && filteredStaffs.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="border-t border-[#eef0f4] px-4 py-10 text-center text-slate-500"
                          >
                            No matching staff found.
                          </td>
                        </tr>
                      )}

                      {!loading &&
                        !error &&
                        filteredStaffs.map((staff, index) => {
                          const status = getStatusInfo(staff);
                          return (
                            <tr key={`${staff.userId || staff.email}-${index}`} className="hover:bg-[#fafbfc] transition-colors">
                              <td className="border-t border-[#eef0f4] px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-600">
                                    {getNameInitial(staff.fullName || staff.email)}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-800">
                                      {staff.fullName || 'Not updated'}
                                    </p>
                                    <p className="text-xs text-slate-500">{staff.email || '-'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="border-t border-[#eef0f4] px-4 py-4 text-slate-700">
                                {staff.phone || '-'}
                              </td>
                              <td className="border-t border-[#eef0f4] px-4 py-4 text-slate-700">
                                {mapRoleLabel(staff.role)}
                              </td>
                              <td className="border-t border-[#eef0f4] px-4 py-4">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                                >
                                  {status.label}
                                </span>
                              </td>
                              <td className="border-t border-[#eef0f4] px-4 py-4 text-slate-600">
                                {formatDate(staff.createdAt)}
                              </td>
                              <td className="border-t border-[#eef0f4] px-4 py-4">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleViewStaff(staff)}
                                    className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
                                    aria-label={`View ${staff.fullName || staff.email}`}
                                  >
                                    <Eye className="h-4 w-4" aria-hidden="true" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleUnavailableAction}
                                    className="rounded-md p-1.5 text-blue-500 transition hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label={`Edit ${staff.fullName || staff.email}`}
                                  >
                                    <Pencil className="h-4 w-4" aria-hidden="true" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleUnavailableAction}
                                    className="rounded-md p-1.5 text-red-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    aria-label={`Ban ${staff.fullName || staff.email}`}
                                  >
                                    <Ban className="h-4 w-4" aria-hidden="true" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
      <Dialog open={isCreateDialogOpen} onOpenChange={closeCreateDialog}>
        <DialogContent className="sm:max-w-[560px] border-[#d9dce3] bg-white text-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Add New Staff</DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCreateStaff}>
            <div className="space-y-2">
              <Label htmlFor="staff-full-name">Full Name</Label>
              <Input
                id="staff-full-name"
                value={formData.fullName}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, fullName: event.target.value }));
                  setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
                placeholder="Nguyen Van Staff"
                className={`bg-white text-slate-900 ${fieldErrors.fullName ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {fieldErrors.fullName && (
                <p className="text-xs text-red-600">{fieldErrors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-email">Email</Label>
              <Input
                id="staff-email"
                type="email"
                value={formData.email}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, email: event.target.value }));
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="staff1@gmail.com"
                className={`bg-white text-slate-900 ${fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {fieldErrors.email && <p className="text-xs text-red-600">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-phone">Phone Number</Label>
              <Input
                id="staff-phone"
                type="tel"
                value={formData.phone}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, phone: event.target.value }));
                  setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                placeholder="0901239365"
                className={`bg-white text-slate-900 ${fieldErrors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {fieldErrors.phone && <p className="text-xs text-red-600">{fieldErrors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-password">Password</Label>
              <Input
                id="staff-password"
                type="password"
                value={formData.password}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, password: event.target.value }));
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="Minimum 6 characters"
                className={`bg-white text-slate-900 ${fieldErrors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            {submitError && (
               <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {submitError}
              </div>
            )}

            <DialogFooter className="gap-2 pt-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => closeCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className="rounded-xl bg-[#f97316] text-white hover:bg-[#ea580c]"
              >
                {creating ? 'Creating...' : 'Create Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[480px] border-[#d9dce3] bg-white text-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Staff Information</DialogTitle>
            <DialogDescription>Detailed information of the selected staff member.</DialogDescription>
          </DialogHeader>

          {selectedStaff && (
            <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Full Name</span>
                <span className="font-medium text-slate-800">{selectedStaff.fullName || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Email</span>
                <span className="font-medium text-slate-800">{selectedStaff.email || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Phone Number</span>
                <span className="font-medium text-slate-800">{selectedStaff.phone || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Role</span>
                <span className="font-medium text-slate-800">{mapRoleLabel(selectedStaff.role)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Created At</span>
                <span className="font-medium text-slate-800">{formatDate(selectedStaff.createdAt)}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
