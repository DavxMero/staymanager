import { supabase } from './supabaseClient';
import { BillingItem, Deposit, POSTransaction, POSTransactionItem } from '@/types';
import { formatCurrency } from '@/lib/utils';

export const billingItemsApi = {
  getByReservationId: async (reservationId: number) => {
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

  getUnpaidByReservationId: async (reservationId: number) => {
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

export const posTransactionsApi = {
  create: async (transaction: Omit<POSTransaction, 'id' | 'created_at'>) => {
    try {
      console.log('Creating POS transaction with data:', transaction);
      
      if (!transaction.total_amount || transaction.total_amount <= 0) {
        console.warn('Invalid total amount:', transaction.total_amount);
        throw new Error('Total amount must be greater than 0');
      }
      if (!transaction.payment_method) {
        console.warn('Missing payment method');
        throw new Error('Payment method is required');
      }
      if (!transaction.transaction_type) {
        console.warn('Missing transaction type');
        throw new Error('Transaction type is required');
      }
      
      if (transaction.items && transaction.items.length > 0) {
        const invalidItems = transaction.items.filter(item => 
          !item.item_name || 
          item.quantity <= 0 || 
          item.unit_price < 0 || 
          item.total_price <= 0
        );
        
        if (invalidItems.length > 0) {
          console.warn('Invalid items found:', invalidItems);
          throw new Error(`Found ${invalidItems.length} invalid items. Please check item names, quantities, and prices.`);
        }
      }
      
      const { data: transactionData, error: transactionError } = await supabase
        .from('pos_transactions')
        .insert({
          reservation_id: transaction.reservation_id || null,
          guest_id: transaction.guest_id || null,
          total_amount: transaction.total_amount,
          payment_method: transaction.payment_method,
          status: transaction.status || 'completed',
          transaction_type: transaction.transaction_type,
          notes: transaction.notes || null,
          cash_received: transaction.cash_received || null,
          change_amount: transaction.change_amount || null
        })
        .select()
        .single();
      
      if (transactionError) {
        console.error('Transaction creation error:', transactionError);
        throw new Error(`Database error creating transaction: ${transactionError.message}`);
      }
      
      console.log('Transaction created successfully:', transactionData);
      
      if (transaction.items && transaction.items.length > 0) {
        console.log('Creating transaction items:', transaction.items);
        
        const itemsToInsert = transaction.items.map(item => ({
          transaction_id: transactionData.id,
          item_name: item.item_name || 'Unnamed Item',
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          total_price: item.total_price || 0,
          category: item.category || 'misc'
        }));
        
        console.log('Items to insert:', itemsToInsert);
        
        const { data: itemsData, error: itemsError } = await supabase
          .from('pos_transaction_items')
          .insert(itemsToInsert)
          .select();
        
        if (itemsError) {
          console.error('Items creation error:', itemsError);
          await supabase.from('pos_transactions').delete().eq('id', transactionData.id);
          throw new Error(`Database error creating transaction items: ${itemsError.message}`);
        }
        
        console.log('Items created successfully:', itemsData);
        
        return {
          ...transactionData,
          items: itemsData
        } as POSTransaction;
      }
      
      return {
        ...transactionData,
        items: []
      } as POSTransaction;
    } catch (error) {
      console.error('Error creating POS transaction:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      
      if (error instanceof Error) {
        throw new Error(`Failed to create POS transaction: ${error.message}`);
      } else {
        throw new Error(`Failed to create POS transaction: ${JSON.stringify(error)}`);
      }
    }
  },

  getById: async (id: number) => {
    try {
      const { data: transactionData, error: transactionError } = await supabase
        .from('pos_transactions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (transactionError) throw transactionError;
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('pos_transaction_items')
        .select('*')
        .eq('transaction_id', id)
        .order('id');
      
      if (itemsError) throw itemsError;
      
      return {
        ...transactionData,
        items: itemsData || []
      } as POSTransaction;
    } catch (error) {
      console.error('Error fetching POS transaction:', error);
      throw error;
    }
  },

  getByReservationId: async (reservationId: number) => {
    try {
      const { data, error } = await supabase
        .from('pos_transactions')
        .select(`
          *,
          pos_transaction_items (*)
        `)
        .eq('reservation_id', reservationId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(transaction => ({
        ...transaction,
        items: transaction.pos_transaction_items || []
      })) as POSTransaction[];
    } catch (error) {
      console.error('Error fetching POS transactions by reservation:', error);
      throw error;
    }
  },

  updateStatus: async (id: number, status: POSTransaction['status']) => {
    try {
      const { data, error } = await supabase
        .from('pos_transactions')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating POS transaction status:', error);
      throw error;
    }
  },

  getDailySummary: async (date: string) => {
    try {
      const { data, error } = await supabase
        .from('pos_transactions')
        .select('total_amount, payment_method, transaction_type')
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59`)
        .eq('status', 'completed');
      
      if (error) throw error;
      
      const summary = {
        total_amount: data.reduce((sum, t) => sum + t.total_amount, 0),
        transaction_count: data.length,
        by_payment_method: {} as Record<string, number>,
        by_type: {} as Record<string, number>
      };
      
      data.forEach(t => {
        summary.by_payment_method[t.payment_method] = 
          (summary.by_payment_method[t.payment_method] || 0) + t.total_amount;
        summary.by_type[t.transaction_type] = 
          (summary.by_type[t.transaction_type] || 0) + t.total_amount;
      });
      
      return summary;
    } catch (error) {
      console.error('Error fetching daily POS summary:', error);
      throw error;
    }
  }
};
