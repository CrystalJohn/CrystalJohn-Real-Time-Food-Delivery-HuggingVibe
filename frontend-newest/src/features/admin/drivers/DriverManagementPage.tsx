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
import { useDriverManagement } from './useDriverManagement';
import type { CreateDriverRequest, DriverAccount } from './driver.service';

interface CreateDriverFormState {
  email: string;
  fullName: string;
  phone: string;
  password: string;
  vehicleType: string;
  licensePlate: string;
}

interface CreateDriverFieldErrors {
  email?: string;
  fullName?: string;
  phone?: string;
  password?: string;
  vehicleType?: string;
  licensePlate?: string;
}

const INITIAL_FORM_STATE: CreateDriverFormState = {
  email: '',
  fullName: '',
  phone: '',
  password: '',
  vehicleType: '',
  licensePlate: '',
};

function getFirstFieldError(values?: string[]): string | undefined {
  return values && values.length > 0 ? values[0] : undefined;
}

function mapCreateDriverErrors(error: ApiError): CreateDriverFieldErrors {
  const fieldErrors: CreateDriverFieldErrors = {
    email: getFirstFieldError(error.errors?.email),
    fullName: getFirstFieldError(error.errors?.fullName ?? error.errors?.name),
    phone: getFirstFieldError(error.errors?.phone),
    password: getFirstFieldError(error.errors?.password),
    vehicleType: getFirstFieldError(error.errors?.vehicleType),
    licensePlate: getFirstFieldError(error.errors?.licensePlate),
  };

  if (error.statusCode === 409 && !fieldErrors.email) {
    fieldErrors.email = 'Email already exists in the system.';
  }

  return fieldErrors;
}

function getNameInitial(value: string): string {
  const normalized = value.trim();
  if (!normalized) return 'D';
  return normalized.charAt(0).toUpperCase();
}

function getStatusInfo(driver: DriverAccount): { label: string; className: string } {
  if (driver.isActive === false || driver.status?.toUpperCase() === 'INACTIVE') {
    return {
      label: 'Inactive',
      className: 'bg-slate-200 text-slate-600',
    };
  }

  return {
    label: driver.status ?? 'Active',
    className: 'bg-emerald-100 text-emerald-700',
  };
}

function getOnlineInfo(driver: DriverAccount): { label: string; className: string } {
  if (driver.isOnline === true) {
    return { label: 'Online', className: 'bg-emerald-100 text-emerald-700' };
  }
  if (driver.isOnline === false) {
    return { label: 'Offline', className: 'bg-amber-100 text-amber-700' };
  }
  return { label: '-', className: 'bg-slate-100 text-slate-500' };
}

function containsSearchTerm(driver: DriverAccount, searchTerm: string): boolean {
  const normalizedQuery = searchTerm.toLowerCase();
  return (
    driver.fullName.toLowerCase().includes(normalizedQuery) ||
    driver.email.toLowerCase().includes(normalizedQuery) ||
    driver.phone.toLowerCase().includes(normalizedQuery) ||
    (driver.licensePlate ?? '').toLowerCase().includes(normalizedQuery)
  );
}

export function DriverManagementPage() {
  const { drivers, loading, creating, error, createDriver, refetch } = useDriverManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<DriverAccount | null>(null);
  const [formData, setFormData] = useState<CreateDriverFormState>(INITIAL_FORM_STATE);
  const [fieldErrors, setFieldErrors] = useState<CreateDriverFieldErrors>({});
  const [submitError, setSubmitError] = useState('');

  const filteredDrivers = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim();
    if (!normalizedSearchTerm) return drivers;
    return drivers.filter((driver) => containsSearchTerm(driver, normalizedSearchTerm));
  }, [searchTerm, drivers]);

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

  const handleViewDriver = (driver: DriverAccount) => {
    setSelectedDriver(driver);
    setIsDetailDialogOpen(true);
  };

  const handleUnavailableAction = () => {
    toast.info('Update/delete driver APIs are not ready. Currently only supporting Read and Create.');
  };

  const validateForm = (): boolean => {
    const nextErrors: CreateDriverFieldErrors = {};
    const emailValue = formData.email.trim();
    const fullNameValue = formData.fullName.trim();
    const phoneValue = formData.phone.trim();
    const vehicleTypeValue = formData.vehicleType.trim();
    const licensePlateValue = formData.licensePlate.trim();

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

    if (!vehicleTypeValue) {
      nextErrors.vehicleType = 'Please enter the vehicle type.';
    }

    if (!licensePlateValue) {
      nextErrors.licensePlate = 'Please enter the license plate.';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreateDriver = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    const payload: CreateDriverRequest = {
      email: formData.email.trim(),
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
      vehicleType: formData.vehicleType.trim(),
      licensePlate: formData.licensePlate.trim(),
    };

    try {
      await createDriver(payload);
      toast.success(`Successfully created driver account for ${payload.fullName}.`);
      closeCreateDialog(false);
    } catch (err) {
      if (err instanceof ApiError) {
        const mappedErrors = mapCreateDriverErrors(err);
        setFieldErrors(mappedErrors);
        if (!Object.values(mappedErrors).some(Boolean)) {
          setSubmitError(err.message || 'Failed to create driver account.');
        }
      } else if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError('Failed to create driver account.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-4xl font-bold leading-tight text-slate-800">Manage Driver</h2>
                </div>
                <Button
                  type="button"
                  onClick={openCreateDialog}
                  className="h-11 rounded-2xl bg-[#f97316] px-6 text-base font-semibold text-white hover:bg-[#ea580c]"
                >
                  <Plus className="h-5 w-5" />
                  <span> Add new driver</span>
                </Button>
              </div>

              <div className="mt-6 max-w-[520px]">
                <div className="relative">
                  <Label htmlFor="search-driver" className="sr-only">Search driver</Label>
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <Input
                    id="search-driver"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by name, email, license plate..."
                    className="h-11 rounded-2xl border-[#d2d6dd] bg-white pl-10 text-sm"
                  />
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-[#d8dbe2] bg-white shadow-sm">
                <div className="max-h-[56vh] overflow-auto">
                  <table className="min-w-[980px] w-full text-left text-sm">
                    <caption className="sr-only">List of drivers</caption>
                    <thead className="sticky top-0 z-10 bg-[#f6f7f9] text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th scope="col" className="px-4 py-4 font-semibold">Driver</th>
                        <th scope="col" className="px-4 py-4 font-semibold">Phone Number</th>
                        <th scope="col" className="px-4 py-4 font-semibold">Vehicle</th>
                        <th scope="col" className="px-4 py-4 font-semibold">License Plate</th>
                        <th scope="col" className="px-4 py-4 font-semibold">Status</th>
                        <th scope="col" className="px-4 py-4 font-semibold">Online</th>
                        <th scope="col" className="px-4 py-4 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && (
                        <tr>
                          <td
                            colSpan={7}
                            className="border-t border-[#eef0f4] px-4 py-10 text-center text-slate-500"
                          >
                            Loading drivers list...
                          </td>
                        </tr>
                      )}

                      {!loading && error && (
                        <tr>
                          <td
                            colSpan={7}
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

                      {!loading && !error && filteredDrivers.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="border-t border-[#eef0f4] px-4 py-10 text-center text-slate-500"
                          >
                            No matching drivers found.
                          </td>
                        </tr>
                      )}

                      {!loading &&
                        !error &&
                        filteredDrivers.map((driver, index) => {
                          const status = getStatusInfo(driver);
                          const online = getOnlineInfo(driver);
                          return (
                            <tr key={`${driver.userId || driver.email}-${index}`} className="hover:bg-[#fafbfc] transition-colors">
                              <td className="border-t border-[#eef0f4] px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-600">
                                    {getNameInitial(driver.fullName || driver.email)}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-800">
                                      {driver.fullName || 'Not updated'}
                                    </p>
                                    <p className="text-xs text-slate-500">{driver.email || '-'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="border-t border-[#eef0f4] px-4 py-4 text-slate-700">
                                {driver.phone || '-'}
                              </td>
                              <td className="border-t border-[#eef0f4] px-4 py-4 text-slate-700">
                                {driver.vehicleType || '-'}
                              </td>
                              <td className="border-t border-[#eef0f4] px-4 py-4 text-slate-700">
                                {driver.licensePlate || '-'}
                              </td>
                              <td className="border-t border-[#eef0f4] px-4 py-4">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                                >
                                  {status.label}
                                </span>
                              </td>
                              <td className="border-t border-[#eef0f4] px-4 py-4">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${online.className}`}
                                >
                                  {online.label}
                                </span>
                              </td>
                              <td className="border-t border-[#eef0f4] px-4 py-4">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleViewDriver(driver)}
                                    className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
                                    aria-label={`View ${driver.fullName || driver.email}`}
                                  >
                                    <Eye className="h-4 w-4" aria-hidden="true" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleUnavailableAction}
                                    className="rounded-md p-1.5 text-blue-500 transition hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label={`Edit ${driver.fullName || driver.email}`}
                                  >
                                    <Pencil className="h-4 w-4" aria-hidden="true" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleUnavailableAction}
                                    className="rounded-md p-1.5 text-red-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    aria-label={`Ban ${driver.fullName || driver.email}`}
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
        <DialogContent className="sm:max-w-[600px] border-[#d9dce3] bg-white text-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Add New Driver</DialogTitle>
            <DialogDescription className="text-slate-500">
              Create a new driver account using the POST /admin/drivers endpoint.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCreateDriver}>
            <div className="space-y-2">
              <Label htmlFor="driver-full-name">Full Name</Label>
              <Input
                id="driver-full-name"
                value={formData.fullName}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, fullName: event.target.value }));
                  setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
                placeholder="Nguyen Van Driver"
                className={`bg-white text-slate-900 ${fieldErrors.fullName ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {fieldErrors.fullName && (
                <p className="text-xs text-red-600">{fieldErrors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver-email">Email</Label>
              <Input
                id="driver-email"
                type="email"
                value={formData.email}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, email: event.target.value }));
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="driver1@gmail.com"
                className={`bg-white text-slate-900 ${fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {fieldErrors.email && <p className="text-xs text-red-600">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver-phone">Phone Number</Label>
              <Input
                id="driver-phone"
                type="tel"
                value={formData.phone}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, phone: event.target.value }));
                  setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                placeholder="0908888888"
                className={`bg-white text-slate-900 ${fieldErrors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {fieldErrors.phone && <p className="text-xs text-red-600">{fieldErrors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver-password">Password</Label>
              <Input
                id="driver-password"
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

            <div className="space-y-2">
              <Label htmlFor="driver-vehicle">Vehicle Type</Label>
              <Input
                id="driver-vehicle"
                value={formData.vehicleType}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, vehicleType: event.target.value }));
                  setFieldErrors((prev) => ({ ...prev, vehicleType: undefined }));
                }}
                placeholder="Motorbike"
                className={`bg-white text-slate-900 ${fieldErrors.vehicleType ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {fieldErrors.vehicleType && (
                <p className="text-xs text-red-600">{fieldErrors.vehicleType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver-license">License Plate</Label>
              <Input
                id="driver-license"
                value={formData.licensePlate}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, licensePlate: event.target.value }));
                  setFieldErrors((prev) => ({ ...prev, licensePlate: undefined }));
                }}
                placeholder="59A1-12345"
                className={`bg-white text-slate-900 ${fieldErrors.licensePlate ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {fieldErrors.licensePlate && (
                <p className="text-xs text-red-600">{fieldErrors.licensePlate}</p>
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
            <DialogTitle>Driver Information</DialogTitle>
            <DialogDescription className="text-slate-500">
              Detailed information of the selected driver.
            </DialogDescription>
          </DialogHeader>

          {selectedDriver && (
            <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Full Name</span>
                <span className="font-medium text-slate-800">{selectedDriver.fullName || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Email</span>
                <span className="font-medium text-slate-800">{selectedDriver.email || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Phone Number</span>
                <span className="font-medium text-slate-800">{selectedDriver.phone || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Vehicle Type</span>
                <span className="font-medium text-slate-800">{selectedDriver.vehicleType || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">License Plate</span>
                <span className="font-medium text-slate-800">{selectedDriver.licensePlate || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Status</span>
                <span className="font-medium text-slate-800">{selectedDriver.status || '-'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Online</span>
                <span className="font-medium text-slate-800">
                  {selectedDriver.isOnline == null ? '-' : selectedDriver.isOnline ? 'Online' : 'Offline'}
                </span>
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
