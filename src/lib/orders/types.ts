export type Department = "Sales" | "Production" | "Finance" | "Logistics" | "Marketing";

export type OrderStatus =
  | "Waiting for Sales"
  | "Waiting for Production"
  | "Waiting for Finance"
  | "Waiting for Logistics"
  | "Waiting for Marketing"
  | "In Production"
  | "Materials Being Purchased"
  | "Ready for Delivery"
  | "Delivered"
  | "Completed"
  | "Cancelled";

export interface TimelineEvent {
  id: string;
  timestamp: string;
  employee_name: string;
  department: Department;
  action: string;
  notes?: string;
}

export interface OrderLineItem {
  id: string;
  product_sku: string;
  product_name: string;
  qty: number;
  uom: string;
  unit_price: number;
  total_price: number;
}

export interface MaterialRequisitionItem {
  id: string;
  material_sku: string;
  material_name: string;
  qty_needed: number;
  uom: string;
  supplier_name?: string;
  estimated_unit_cost?: number;
  total_cost?: number;
}

export interface UnifiedOrder {
  id: string;
  order_number: string;
  customer_name: string;
  client_po_ref: string;
  delivery_address: string;
  po_date: string;
  delivery_date?: string;
  payment_terms: string;
  prepared_by: string;
  authorized_by?: string;
  po_photo_url?: string;

  current_status: OrderStatus;
  current_department_responsible: Department;
  assigned_employee?: string;
  last_updated_by: string;
  last_updated_time: string;

  items: OrderLineItem[];
  requested_materials?: MaterialRequisitionItem[];
  subtotal: number;
  vat_amount: number;
  grand_total: number;

  timeline: TimelineEvent[];
}
