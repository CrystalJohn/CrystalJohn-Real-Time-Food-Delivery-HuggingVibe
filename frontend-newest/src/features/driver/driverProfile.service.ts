import { api } from '@/lib/api';

export interface DriverProfileResponse {
  userId: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  userIsActive: boolean;
  status: string;
  isOnline: boolean;
  vehicleType?: string | null;
  licensePlate?: string | null;
  updatedAt?: string | null;
}

export const driverProfileService = {
  async getMyProfile(): Promise<DriverProfileResponse> {
    return api.get('/driver/profile/me');
  },

  async goOnline(): Promise<void> {
    await api.patch('/driver/profile/online');
  },

  async goOffline(): Promise<void> {
    await api.patch('/driver/profile/offline');
  },
};