export interface Room {
  id: number;
  created_at: string;
  updated_at?: string;
  number: string;
  type: string;
  floor: number;
  base_price: number;
  max_occupancy: number;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'out-of-order' | 'reserved';
  amenities: string[];
  description?: string;
  custom_type_id?: number;
  images: string[];
  notes?: string;
  price: number;

  // Custom room type relation
  custom_room_types?: CustomRoomType;
}

export interface CustomRoomType {
  id: number;
  created_at: string;
  updated_at?: string;
  name: string;
  description?: string;
  base_price: number;
  max_occupancy: number;
  amenities: string[];
  features: string[];
  color_theme: object;
  images: string[];
  is_active: boolean;
  room_size?: number;
  bed_configuration?: string;
  view_type?: string;
  special_features?: string[];
}

export interface CustomRoomTypeFeature {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  category: 'comfort' | 'technology' | 'bathroom' | 'view' | 'accessibility' | 'service' | 'other';
  is_premium?: boolean;
}

export interface Guest {
  id: number;
  created_at: string;
  full_name: string;
  email?: string;
  phone?: string;
  id_number?: string;
  address?: string;
  nationality?: string;
  date_of_birth?: string;
  status: 'active' | 'inactive' | 'blocked';
  notes?: string;
  updated_at?: string;
}

export interface Reservation {
  id: number;
  created_at: string;
  guest_id: number;
  room_id: number;
  check_in: string;
  check_out: string;
  guests_count: number;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  total_amount: number;
  notes?: string;
}

export interface Invoice {
  id: number;
  created_at: string;
  reservation_id: number;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  payment_method?: string;
  due_date?: string;
}

export interface BillingItem {
  id: number;
  created_at: string;
  reservation_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: 'pending' | 'paid';
  category: 'food' | 'beverage' | 'service' | 'misc';
}

export interface Deposit {
  id: number;
  created_at: string;
  reservation_id: number;
  amount: number;
  payment_method?: string;
  status: 'collected' | 'refunded' | 'applied';
  notes?: string;
}

export interface Profile {
  id: string;
  updated_at?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  role: 'admin' | 'manager' | 'staff';
}

export interface Expense {
  id: number;
  created_at: string;
  description: string;
  amount: number;
  category: 'utilities' | 'maintenance' | 'supplies' | 'staff' | 'marketing' | 'food' | 'cleaning' | 'other';
  subcategory?: string;
  payment_method: 'cash' | 'card' | 'transfer' | 'check';
  receipt_url?: string;
  supplier?: string;
  expense_date: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  notes?: string;
  recurring?: boolean;
  recurring_period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  updated_at?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  budget_limit?: number;
  color?: string;
}

export interface InventoryItem {
  id: number;
  created_at: string;
  name: string;
  description?: string;
  category: 'housekeeping' | 'maintenance' | 'food' | 'beverage' | 'amenities' | 'office' | 'other';
  current_stock: number;
  min_stock: number;
  max_stock: number;
  unit: string;
  unit_cost: number;
  supplier?: string;
  last_restocked?: string;
  location?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued';
  updated_at?: string;
}

export interface GuestFacilityRequest {
  id: number;
  created_at: string;
  guest_id: number;
  reservation_id?: number;
  room_id: number;
  service_type: 'room-service' | 'housekeeping' | 'maintenance' | 'food-order' | 'amenities' | 'other';
  description: string;
  items?: GuestFacilityItem[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  estimated_completion?: string;
  actual_completion?: string;
  total_cost?: number;
  notes?: string;
  rating?: number;
  feedback?: string;
  updated_at?: string;
}

export interface GuestFacilityItem {
  id: number;
  request_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: 'food' | 'beverage' | 'amenity' | 'service';
}

export interface POSTransaction {
  id: number;
  created_at: string;
  reservation_id?: number;
  guest_id?: number;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'transfer' | 'qris' | 'ewallet';
  status: 'pending' | 'completed' | 'cancelled';
  transaction_type: 'checkin' | 'checkout' | 'reservation' | 'deposit' | 'additional';
  items: POSTransactionItem[];
  notes?: string;
  cash_received?: number;
  change_amount?: number;
}

export interface POSTransactionItem {
  id: number;
  transaction_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: 'room' | 'food' | 'beverage' | 'service' | 'deposit' | 'penalty' | 'misc';
}

export interface InventorySupplier {
  id: number;
  created_at: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  rating?: number;
}

export interface InventoryTransaction {
  id: number;
  created_at: string;
  item_id: number;
  transaction_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  unit_cost?: number;
  reference_type?: 'purchase_order' | 'usage' | 'spoilage' | 'initial';
  reference_id?: string;
  notes?: string;
  created_by?: string;
}

export interface PurchaseOrder {
  id: number;
  created_at: string;
  updated_at?: string;
  po_number: string;
  supplier_id?: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'received' | 'cancelled';
  total_amount: number;
  expected_delivery_date?: string;
  notes?: string;
  created_by?: string;

  // Relations
  supplier?: InventorySupplier;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: number;
  created_at: string;
  po_id: number;
  item_id: number;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  total_cost?: number;

  // Relations
  item?: InventoryItem;
}
