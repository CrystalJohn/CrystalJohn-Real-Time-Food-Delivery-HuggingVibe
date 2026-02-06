import { api } from '@/lib/api';
import type { KitchenTicket } from '@/types';

export const staffService = {
  async getQueue(): Promise<KitchenTicket[]> {
    return api.get<KitchenTicket[]>('/staff/queue');
  },

  async acceptTicket(ticketId: string): Promise<KitchenTicket> {
    return api.patch<KitchenTicket>(`/staff/queue/${ticketId}/accept`);
  },

  async completeTicket(ticketId: string): Promise<KitchenTicket> {
    return api.patch<KitchenTicket>(`/staff/queue/${ticketId}/complete`);
  },

  async rejectTicket(ticketId: string): Promise<KitchenTicket> {
    return api.patch<KitchenTicket>(`/staff/queue/${ticketId}/reject`);
  },
};
