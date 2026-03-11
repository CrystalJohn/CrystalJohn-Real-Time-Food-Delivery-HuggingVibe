export const TICKET_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['READY', 'REJECTED'],
  READY: [],
  REJECTED: [],
};
