-- Enable RLS on 12 unprotected tables and add permissive policies for authenticated users.
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ncjneagfadrmivgicszm/sql/new
--
-- Effect:
--   - Anon role (not logged in) loses access to these tables (security improvement)
--   - Authenticated users keep full access (matches existing app behavior)
--   - service_role bypasses RLS, so admin API routes are unaffected

ALTER TABLE public.room_service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_facility_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_facility_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_all_access" ON public.room_service_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_access" ON public.custom_room_types FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_access" ON public.expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_access" ON public.inventory_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_access" ON public.guest_facility_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_access" ON public.guest_facility_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_access" ON public.inventory_suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_access" ON public.inventory_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_access" ON public.inventory_purchase_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_access" ON public.inventory_purchase_order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_access" ON public.roles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_access" ON public.user_roles FOR ALL TO authenticated USING (true) WITH CHECK (true);
