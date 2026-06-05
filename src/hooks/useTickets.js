import { useCallback, useMemo } from 'react';
import { apiRequest } from '../config/api.js';
import { useAppStore } from '../store/useAppStore.js';

export function useTickets() {
  const userSession = useAppStore((state) => state.userSession);
  const tickets = useAppStore((state) => state.tickets);
  const clientTickets = useAppStore((state) => state.clientTickets);
  const setTickets = useAppStore((state) => state.setTickets);
  const setClientTickets = useAppStore((state) => state.setClientTickets);
  const showToast = useAppStore((state) => state.showToast);

  const authHeaders = useMemo(
    () => (userSession ? { Authorization: `Bearer ${userSession.token}` } : {}),
    [userSession],
  );

  const fetchAdminTickets = useCallback(async () => {
    const data = await apiRequest('/admin/tickets', { headers: authHeaders });
    setTickets(Array.isArray(data.tickets) ? data.tickets : []);
  }, [authHeaders, setTickets]);

  const fetchClientTickets = useCallback(async () => {
    const data = await apiRequest('/client/tickets', { headers: authHeaders });
    setClientTickets(Array.isArray(data.tickets) ? data.tickets : []);
  }, [authHeaders, setClientTickets]);

  const createTicket = useCallback(async (payload) => {
    const data = await apiRequest('/tickets', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(payload),
    });

    showToast(`Zgloszenie ${data.ticket.id} zostalo zapisane.`);
    return data.ticket;
  }, [authHeaders, showToast]);

  const updateStatus = useCallback(async (ticketId, nextStatus) => {
    const data = await apiRequest(`/admin/tickets/${ticketId}/status`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status: nextStatus }),
    });

    setTickets(tickets.map((ticket) => (ticket.id === ticketId ? data.ticket : ticket)));
    showToast(`Zaktualizowano status ticketu ${ticketId}.`);
  }, [authHeaders, setTickets, showToast, tickets]);

  const deleteTicket = useCallback(async (ticketId) => {
    await apiRequest(`/admin/tickets/${ticketId}`, {
      method: 'DELETE',
      headers: {
        ...authHeaders,
        'x-admin-key': import.meta.env.VITE_ADMIN_SECRET_KEY || '',
      },
    });

    setTickets(tickets.filter((ticket) => ticket.id !== ticketId));
    showToast(`Usunieto zgloszenie ${ticketId}.`);
  }, [authHeaders, setTickets, showToast, tickets]);

  return {
    tickets,
    clientTickets,
    fetchAdminTickets,
    fetchClientTickets,
    createTicket,
    updateStatus,
    deleteTicket,
  };
}
