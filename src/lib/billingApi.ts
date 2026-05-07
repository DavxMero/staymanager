import { supabase } from './supabaseClient';
import { BillingItem, Deposit } from '@/types';

export const billingItemsApi = {
  getByReservationId: async (reservationId: string) => {
    try {
      const { data, error } = await supabase
        .from('billing_items')
        .select('*')
        .eq('reservation_id', reservationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BillingItem[];
    } catch (error) {
      console.error('Error fetching billing items:', error);
      throw error;
    }
  },

  create: async (billingItem: Omit<BillingItem, 'id' | 'created_at'>) => {
    try {
      console.log('Creating billing item with data:', billingItem);
      const { data, error } = await supabase
        .from('billing_items')
        .insert(billingItem)
        .select()
        .single();

      if (error) throw error;
      console.log('Billing item created successfully:', data);
      return data as BillingItem;
    } catch (error) {
      console.error('Error creating billing item:', error);
      console.error('Billing item data being inserted:', billingItem);
      throw new Error(`Failed to create billing item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  update: async (id: number, updates: Partial<BillingItem>) => {
    try {
      console.log(`Updating billing item ${id} with data:`, updates);
      const { data, error } = await supabase
        .from('billing_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      console.log('Billing item updated successfully:', data);
      return data as BillingItem;
    } catch (error) {
      console.error('Error updating billing item:', error);
      console.error(`Billing item ${id} update data:`, updates);
      throw new Error(`Failed to update billing item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  delete: async (id: number) => {
    try {
      const { error } = await supabase
        .from('billing_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting billing item:', error);
      throw error;
    }
  },

  getUnpaidByReservationId: async (reservationId: string) => {
    try {
      const { data, error } = await supabase
        .from('billing_items')
        .select('*')
        .eq('reservation_id', reservationId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BillingItem[];
    } catch (error) {
      console.error('Error fetching unpaid billing items:', error);
      throw error;
    }
  },
};

export const depositsApi = {
  getByReservationId: async (reservationId: number) => {
    try {
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .eq('reservation_id', reservationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Deposit[];
    } catch (error) {
      console.error('Error fetching deposits:', error);
      throw error;
    }
  },

  create: async (deposit: Omit<Deposit, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('deposits')
        .insert(deposit)
        .select()
        .single();

      if (error) throw error;
      return data as Deposit;
    } catch (error) {
      console.error('Error creating deposit:', error);
      console.error('Deposit data being inserted:', deposit);
      throw new Error(`Failed to create deposit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  update: async (id: number, updates: Partial<Deposit>) => {
    try {
      console.log(`Updating deposit ${id} with data:`, updates);
      const { data, error } = await supabase
        .from('deposits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      console.log('Deposit updated successfully:', data);
      return data as Deposit;
    } catch (error) {
      console.error('Error updating deposit:', error);
      console.error(`Deposit ${id} update data:`, updates);
      throw new Error(`Failed to update deposit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  delete: async (id: number) => {
    try {
      const { error } = await supabase
        .from('deposits')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting deposit:', error);
      throw error;
    }
  },
};
