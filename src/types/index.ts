export interface Room {
  id: string;
  number: string;
  type: string;
  floor: number;
  base_price: number;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'out-of-order' | 'reserved' | string;
  created_at?: string;
  updated_at?: string;
  image_url?: string;
  
  
  max_occupancy?: number;
  amenities?: string[];
  description?: string;
  custom_type_id?: number;
  images?: string[];
  notes?: string;
  price?: number;
  custom_room_types?: CustomRoomType;
}

export interface CustomRoomType {
  id: number;
  created_at?: string;
  updated_at?: string;
  name: string;
  description?: string;
  base_price: number;
  max_occupancy: number;
  amenities?: any;
  features?: any;
  color_theme?: any;
  images?: any;
  is_active?: boolean;
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
  category: 'comfort' | 'technology' | 'bathroom' | 'view' | 'accessibility' | 'service' | 'other' | string;
  is_premium?: boolean;
}

export interface Guest {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  id_number?: string;
  nationality?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  
  
  date_of_birth?: string;
  status?: 'active' | 'inactive' | 'blocked' | string;
  notes?: string;
}

export interface Reservation {
  id: string;
  booking_id: string;
  guest_id?: string;
  guest_name: string;
  guest_email?: string;
  guest_phone?: string;
  room_id?: string;
  room_number?: string;
  room_type?: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  room_rate: number;
  room_total: number;
  total_amount: number;
  payment_status: string;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled' | string;
  breakfast_included: boolean;
  breakfast_pax: number;
  breakfast_price: number;
  breakfast_total: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  actual_check_in?: string;
  actual_check_out?: string;
  total_price: number;
  guest_count: number;
  booking_reference?: string;

  guests?: Pick<Guest, 'full_name'> | Guest;
  rooms?: Pick<Room, 'number'> | Room;
}

export interface Invoice {
  id: number;
  invoice_number?: string;
  subtotal: number;
  tax_amount: number;
  service_charge?: number;
  discount_amount: number;
  total_amount: number;
  amount: number; 
  status: string;
  payment_method?: string;
  payment_reference?: string;
  issue_date?: string;
  due_date?: string;
  paid_at?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  reservation_id: string;
  guest_id?: string;
}

export interface BillingItem {
  id: number;
  reservation_id: string;
  room_id?: string;
  guest_id?: string;
  item_name: string;
  description?: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  tax_rate?: number;
  tax_amount: number;
  status: string;
  billed_at?: string;
  service_date: string;
  added_by?: string;
  notes?: string;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface Deposit {
  id: number;
  reservation_id: number;
  amount: number;
  currency?: string;
  payment_method: string;
  payment_reference?: string;
  status: string;
  collected_at?: string;
  refunded_at?: string;
  collected_by?: string;
  refunded_by?: string;
  notes?: string;
  refund_reason?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  user_id?: string;
  employee_id?: string;
  username?: string;
  full_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  role: string;
  department?: string;
  is_active?: boolean;
  hire_date?: string;
  salary?: number;
  permissions?: any;
  preferences?: any;
  created_at?: string;
  updated_at?: string;
}

export interface Expense {
  id: number;
  created_at?: string;
  updated_at?: string;
  expense_date: string;
  category: string;
  subcategory?: string;
  amount: number;
  description: string;
  vendor?: string;
  payment_method?: string;
  receipt_number?: string;
  status: string;
  approved_by?: string;
  notes?: string;
  recurring?: boolean;
  recurring_period?: string;
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
  created_at?: string;
  updated_at?: string;
  name: string;
  description?: string;
  category: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  unit: string;
  unit_cost: number;
  supplier?: string;
  last_restocked?: string;
  location?: string;
  status: string;
}

export interface GuestFacilityRequest {
  id: number;
  created_at?: string;
  updated_at?: string;
  guest_id?: number;
  reservation_id?: number;
  room_id?: number;
  service_type: string;
  description: string;
  priority?: string;
  status: string;
  assigned_to?: string;
  estimated_completion?: string;
  actual_completion?: string;
  total_cost?: number;
  notes?: string;
  rating?: number;
  feedback?: string;
  items?: GuestFacilityItem[];
  rooms?: Pick<Room, 'number'> | Room;
}

export interface GuestFacilityItem {
  id: number;
  request_id?: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category?: string;
}

export interface InventorySupplier {
  id: number;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  rating?: number;
  created_at?: string;
}

export interface InventoryTransaction {
  id: number;
  item_id: number;
  transaction_type: string;
  quantity: number;
  unit_cost?: number;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  created_by?: string;
  created_at?: string;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier_id?: number;
  status: string;
  total_amount: number;
  expected_delivery_date?: string;
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;

  supplier?: InventorySupplier;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: number;
  po_id: number;
  item_id: number;
  quantity_ordered: number;
  quantity_received?: number;
  unit_cost: number;
  total_cost?: number;
  created_at?: string;

  item?: InventoryItem;
}
