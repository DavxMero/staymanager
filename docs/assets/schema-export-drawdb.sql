
CREATE TABLE auth_users (
  id uuid NOT NULL PRIMARY KEY,
  email text,
  created_at timestamp with time zone NOT NULL
);


CREATE TABLE chat (
  id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL,
  messages jsonb NOT NULL,
  user_id uuid NOT NULL
);

CREATE TABLE billing_items (
  id integer NOT NULL,
  reservation_id uuid,
  room_id uuid,
  guest_id uuid,
  item_name character varying(255) NOT NULL,
  description text,
  category character varying(100) NOT NULL,
  quantity numeric(10,2) NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  tax_rate numeric(5,2),
  tax_amount numeric(10,2),
  status character varying(50) NOT NULL,
  billed_at timestamp with time zone,
  service_date timestamp with time zone NOT NULL,
  added_by uuid,
  notes text,
  metadata jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

CREATE TABLE custom_room_types (
  id integer NOT NULL,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  name character varying(255) NOT NULL,
  description text,
  base_price numeric(10,2) NOT NULL,
  max_occupancy integer NOT NULL,
  amenities jsonb,
  features jsonb,
  color_theme jsonb,
  images jsonb,
  is_active boolean,
  room_size numeric(8,2),
  bed_configuration character varying(100),
  view_type character varying(100),
  special_features text
);

CREATE TABLE deposits (
  id integer NOT NULL,
  reservation_id uuid NOT NULL,
  amount numeric(12,2) NOT NULL,
  currency character varying(3),
  payment_method character varying(100) NOT NULL,
  payment_reference character varying(255),
  status character varying(50),
  collected_at timestamp with time zone,
  refunded_at timestamp with time zone,
  collected_by uuid,
  refunded_by uuid,
  notes text,
  refund_reason text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

CREATE TABLE expenses (
  id integer NOT NULL,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  expense_date date NOT NULL,
  category character varying(50) NOT NULL,
  subcategory character varying(100),
  amount numeric(10,2) NOT NULL,
  description text NOT NULL,
  vendor character varying(255),
  payment_method character varying(20),
  receipt_number character varying(100),
  status character varying(20),
  approved_by uuid,
  notes text,
  recurring boolean,
  recurring_period character varying(20)
);

CREATE TABLE guest_facility_items (
  id uuid NOT NULL,
  request_id uuid,
  item_name character varying NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  category character varying,
  service_item_id integer
);

CREATE TABLE guest_facility_requests (
  id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  guest_id uuid,
  reservation_id uuid,
  room_id uuid,
  service_type character varying NOT NULL,
  description text NOT NULL,
  priority character varying,
  status character varying,
  assigned_to character varying,
  estimated_completion timestamp with time zone,
  actual_completion timestamp with time zone,
  total_cost numeric,
  notes text,
  rating integer,
  feedback text
);

CREATE TABLE guests (
  id uuid NOT NULL,
  full_name character varying(255) NOT NULL,
  email character varying(255),
  phone character varying(30),
  address text,
  id_number character varying(50),
  nationality character varying(100),
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  user_id uuid
);

CREATE TABLE hotel_settings (
  id uuid NOT NULL,
  brand_name text,
  brand_logo_url text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

CREATE TABLE housekeeping_tasks (
  id integer NOT NULL,
  room_id uuid NOT NULL,
  staff_id integer,
  assigned_to character varying(255),
  task_type character varying(50) NOT NULL,
  title character varying(255) NOT NULL,
  description text,
  status character varying(50) NOT NULL,
  priority character varying(50) NOT NULL,
  estimated_duration integer,
  notes text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_by character varying(100)
);

CREATE TABLE inventory_items (
  id integer NOT NULL,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  name character varying(255) NOT NULL,
  description text,
  category character varying(50) NOT NULL,
  current_stock integer NOT NULL,
  min_stock integer NOT NULL,
  max_stock integer NOT NULL,
  unit character varying(50) NOT NULL,
  unit_cost numeric(10,2) NOT NULL,
  supplier character varying(255),
  last_restocked timestamp with time zone,
  location character varying(255),
  status character varying(20)
);

CREATE TABLE inventory_purchase_order_items (
  id bigint NOT NULL,
  po_id bigint NOT NULL,
  item_id bigint NOT NULL,
  quantity_ordered numeric NOT NULL,
  quantity_received numeric,
  unit_cost numeric NOT NULL,
  total_cost numeric,
  created_at timestamp with time zone NOT NULL
);

CREATE TABLE inventory_purchase_orders (
  id bigint NOT NULL,
  po_number text NOT NULL,
  supplier_id bigint,
  status text NOT NULL,
  total_amount numeric,
  expected_delivery_date date,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone
);

CREATE TABLE inventory_suppliers (
  id bigint NOT NULL,
  name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  address text,
  rating numeric(2,1),
  created_at timestamp with time zone NOT NULL
);

CREATE TABLE inventory_transactions (
  id bigint NOT NULL,
  item_id bigint NOT NULL,
  transaction_type text NOT NULL,
  quantity numeric NOT NULL,
  unit_cost numeric,
  reference_type text,
  reference_id text,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL
);

CREATE TABLE invoices (
  id integer NOT NULL,
  invoice_number character varying(50),
  subtotal numeric(12,2) NOT NULL,
  tax_amount numeric(12,2),
  service_charge numeric(12,2),
  discount_amount numeric(12,2),
  total_amount numeric(12,2) NOT NULL,
  status character varying(50),
  payment_method character varying(100),
  payment_reference character varying(255),
  issue_date date,
  due_date date,
  paid_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  created_by uuid,
  reservation_id uuid,
  guest_id uuid
);

CREATE TABLE payments (
  id uuid NOT NULL,
  reservation_id uuid,
  amount numeric(10,2) NOT NULL,
  payment_method character varying(50) NOT NULL,
  payment_date timestamp with time zone,
  status character varying(20) NOT NULL,
  notes text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  transaction_id text
);

CREATE TABLE profiles (
  id uuid NOT NULL,
  user_id uuid,
  employee_id character varying(50),
  username character varying(50),
  full_name character varying(255) NOT NULL,
  email character varying(255),
  phone character varying(50),
  avatar_url text,
  role character varying(50) NOT NULL,
  department character varying(100),
  is_active boolean,
  hire_date date,
  salary numeric(12,2),
  permissions jsonb,
  preferences jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

CREATE TABLE reservations (
  id uuid NOT NULL,
  booking_id character varying(20) NOT NULL,
  guest_id uuid,
  guest_name character varying(255) NOT NULL,
  guest_email character varying(255),
  guest_phone character varying(30),
  room_id uuid,
  room_number character varying(10),
  room_type character varying(50),
  check_in date NOT NULL,
  check_out date NOT NULL,
  adults integer NOT NULL,
  children integer NOT NULL,
  room_rate numeric(10,2) NOT NULL,
  room_total numeric(10,2) NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  payment_status character varying(20) NOT NULL,
  status character varying(20) NOT NULL,
  breakfast_included boolean NOT NULL,
  breakfast_pax integer NOT NULL,
  breakfast_price numeric(10,2) NOT NULL,
  breakfast_total numeric(10,2) NOT NULL,
  notes text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  actual_check_in timestamp with time zone,
  actual_check_out timestamp with time zone,
  total_price numeric(10,2) NOT NULL,
  guest_count integer NOT NULL,
  booking_reference character varying(20)
);

CREATE TABLE roles (
  id uuid NOT NULL,
  name text NOT NULL,
  display_name text NOT NULL,
  description text,
  permissions jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

CREATE TABLE room_service_requests (
  id bigint NOT NULL,
  room_number text NOT NULL,
  guest_name text NOT NULL,
  guest_phone text,
  service_type text NOT NULL,
  priority text,
  status text,
  description text NOT NULL,
  notes text,
  assigned_to text,
  assigned_to_id bigint,
  requested_at timestamp with time zone,
  assigned_at timestamp with time zone,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  estimated_completion timestamp with time zone,
  updated_at timestamp with time zone,
  urgency_level integer,
  department text,
  location_floor integer,
  room_id uuid,
  guest_id uuid,
  staff_id integer,
  service_item_id integer,
  created_by_user_id uuid
);

CREATE TABLE rooms (
  id uuid NOT NULL,
  number character varying(10) NOT NULL,
  type character varying(50) NOT NULL,
  floor integer NOT NULL,
  base_price numeric(10,2) NOT NULL,
  status character varying(20) NOT NULL,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  image_url text,
  images jsonb NOT NULL
);

CREATE TABLE service_items (
  id integer NOT NULL,
  service_code character varying(50),
  name character varying(255) NOT NULL,
  description text,
  category character varying(100) NOT NULL,
  price numeric(12,2) NOT NULL,
  price_type character varying(50),
  currency character varying(3),
  is_available boolean,
  requires_booking boolean,
  advance_booking_hours integer,
  estimated_duration integer,
  max_pax integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  is_active boolean
);

CREATE TABLE staff_members (
  id integer NOT NULL,
  full_name character varying(255) NOT NULL,
  employee_id character varying(50),
  role character varying(100) NOT NULL,
  phone character varying(20),
  email character varying(255),
  is_active boolean NOT NULL,
  hire_date date,
  notes text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

CREATE TABLE user_roles (
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  role_id uuid NOT NULL,
  assigned_by uuid,
  assigned_at timestamp with time zone
);

CREATE TABLE users (
  id uuid NOT NULL,
  email text,
  full_name text,
  avatar_url text,
  instructions text,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL
);


ALTER TABLE chat ADD CONSTRAINT chat_pkey PRIMARY KEY (id);
ALTER TABLE billing_items ADD CONSTRAINT billing_items_pkey PRIMARY KEY (id);
ALTER TABLE custom_room_types ADD CONSTRAINT custom_room_types_pkey PRIMARY KEY (id);
ALTER TABLE deposits ADD CONSTRAINT deposits_pkey PRIMARY KEY (id);
ALTER TABLE expenses ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);
ALTER TABLE guest_facility_items ADD CONSTRAINT guest_facility_items_pkey PRIMARY KEY (id);
ALTER TABLE guest_facility_requests ADD CONSTRAINT guest_facility_requests_pkey PRIMARY KEY (id);
ALTER TABLE guests ADD CONSTRAINT guests_pkey PRIMARY KEY (id);
ALTER TABLE hotel_settings ADD CONSTRAINT hotel_settings_pkey PRIMARY KEY (id);
ALTER TABLE housekeeping_tasks ADD CONSTRAINT housekeeping_tasks_pkey PRIMARY KEY (id);
ALTER TABLE inventory_items ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);
ALTER TABLE inventory_purchase_order_items ADD CONSTRAINT inventory_purchase_order_items_pkey PRIMARY KEY (id);
ALTER TABLE inventory_purchase_orders ADD CONSTRAINT inventory_purchase_orders_pkey PRIMARY KEY (id);
ALTER TABLE inventory_suppliers ADD CONSTRAINT inventory_suppliers_pkey PRIMARY KEY (id);
ALTER TABLE inventory_transactions ADD CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id);
ALTER TABLE invoices ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);
ALTER TABLE payments ADD CONSTRAINT payments_pkey PRIMARY KEY (id);
ALTER TABLE profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
ALTER TABLE reservations ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);
ALTER TABLE roles ADD CONSTRAINT roles_pkey PRIMARY KEY (id);
ALTER TABLE room_service_requests ADD CONSTRAINT room_service_requests_pkey PRIMARY KEY (id);
ALTER TABLE rooms ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);
ALTER TABLE service_items ADD CONSTRAINT service_items_pkey PRIMARY KEY (id);
ALTER TABLE staff_members ADD CONSTRAINT staff_members_pkey PRIMARY KEY (id);
ALTER TABLE user_roles ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);
ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);


ALTER TABLE chat ADD CONSTRAINT chat_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth_users(id);
ALTER TABLE billing_items ADD CONSTRAINT billing_items_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES guests(id);
ALTER TABLE billing_items ADD CONSTRAINT billing_items_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES reservations(id);
ALTER TABLE billing_items ADD CONSTRAINT billing_items_room_id_fkey FOREIGN KEY (room_id) REFERENCES rooms(id);
ALTER TABLE deposits ADD CONSTRAINT deposits_collected_by_fkey FOREIGN KEY (collected_by) REFERENCES profiles(id);
ALTER TABLE deposits ADD CONSTRAINT deposits_refunded_by_fkey FOREIGN KEY (refunded_by) REFERENCES profiles(id);
ALTER TABLE deposits ADD CONSTRAINT fk_deposits_reservation_id FOREIGN KEY (reservation_id) REFERENCES reservations(id);
ALTER TABLE expenses ADD CONSTRAINT fk_expenses_approved_by FOREIGN KEY (approved_by) REFERENCES auth_users(id);
ALTER TABLE guest_facility_items ADD CONSTRAINT guest_facility_items_request_id_fkey FOREIGN KEY (request_id) REFERENCES guest_facility_requests(id);
ALTER TABLE guest_facility_items ADD CONSTRAINT guest_facility_items_service_item_id_fkey FOREIGN KEY (service_item_id) REFERENCES service_items(id);
ALTER TABLE guest_facility_requests ADD CONSTRAINT guest_facility_requests_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES guests(id);
ALTER TABLE guest_facility_requests ADD CONSTRAINT guest_facility_requests_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES reservations(id);
ALTER TABLE guest_facility_requests ADD CONSTRAINT guest_facility_requests_room_id_fkey FOREIGN KEY (room_id) REFERENCES rooms(id);
ALTER TABLE guests ADD CONSTRAINT guests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth_users(id);
ALTER TABLE housekeeping_tasks ADD CONSTRAINT housekeeping_tasks_room_id_fkey FOREIGN KEY (room_id) REFERENCES rooms(id);
ALTER TABLE housekeeping_tasks ADD CONSTRAINT housekeeping_tasks_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES staff_members(id);
ALTER TABLE inventory_purchase_order_items ADD CONSTRAINT inventory_purchase_order_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES inventory_items(id);
ALTER TABLE inventory_purchase_order_items ADD CONSTRAINT inventory_purchase_order_items_po_id_fkey FOREIGN KEY (po_id) REFERENCES inventory_purchase_orders(id);
ALTER TABLE inventory_purchase_orders ADD CONSTRAINT inventory_purchase_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth_users(id);
ALTER TABLE inventory_purchase_orders ADD CONSTRAINT inventory_purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES inventory_suppliers(id);
ALTER TABLE inventory_transactions ADD CONSTRAINT inventory_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth_users(id);
ALTER TABLE inventory_transactions ADD CONSTRAINT inventory_transactions_item_id_fkey FOREIGN KEY (item_id) REFERENCES inventory_items(id);
ALTER TABLE invoices ADD CONSTRAINT fk_invoices_guest_id FOREIGN KEY (guest_id) REFERENCES guests(id);
ALTER TABLE invoices ADD CONSTRAINT fk_invoices_reservation_id FOREIGN KEY (reservation_id) REFERENCES reservations(id);
ALTER TABLE invoices ADD CONSTRAINT invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id);
ALTER TABLE payments ADD CONSTRAINT payments_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES reservations(id);
ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth_users(id);
ALTER TABLE reservations ADD CONSTRAINT reservations_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES guests(id);
ALTER TABLE reservations ADD CONSTRAINT reservations_room_id_fkey FOREIGN KEY (room_id) REFERENCES rooms(id);
ALTER TABLE room_service_requests ADD CONSTRAINT room_service_requests_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES auth_users(id);
ALTER TABLE room_service_requests ADD CONSTRAINT room_service_requests_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES guests(id);
ALTER TABLE room_service_requests ADD CONSTRAINT room_service_requests_room_id_fkey FOREIGN KEY (room_id) REFERENCES rooms(id);
ALTER TABLE room_service_requests ADD CONSTRAINT room_service_requests_service_item_id_fkey FOREIGN KEY (service_item_id) REFERENCES service_items(id);
ALTER TABLE room_service_requests ADD CONSTRAINT room_service_requests_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES staff_members(id);
ALTER TABLE rooms ADD CONSTRAINT fk_rooms_type_custom_room_types FOREIGN KEY (type) REFERENCES custom_room_types(name);
ALTER TABLE user_roles ADD CONSTRAINT user_roles_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES auth_users(id);
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles(id);
ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth_users(id);
ALTER TABLE users ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth_users(id);
