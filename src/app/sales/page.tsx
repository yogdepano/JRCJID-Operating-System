"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart, Plus, Search, Trash2, MapPin, ArrowRight, Package, Camera, Eye, X } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TopNavbar } from "@/components/Navigation/TopNavbar";
import { RoleGuard } from "@/components/Auth/RoleGuard";

interface OrderLineItem {
  id: string;
  product_sku: string;
  product_name: string;
  qty: number;
  uom: string;
  unit_price: number;
  total_price: number;
}

interface SalesOrder {
  id: string;
  order_number: string;
  customer_name: string;
  client_po_ref: string;
  delivery_address: string;
  po_photo_url?: string;
  order_date: string;
  total_amount: number;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "IN_PRODUCTION" | "DISPATCHED" | "COMPLETED" | "CANCELLED";
  payment_status: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";
  payment_terms: string;
  items: OrderLineItem[];
}

interface ProductCatalogItem {
  sku: string;
  name: string;
  base_price: number;
  default_uom: string;
}

const UOM_OPTIONS = [
  "Drum (200L)",
  "Pail (20L)",
  "Gallon (4L)",
  "Bottle (1L)",
  "L (Liters)",
  "mL (Milliliters)",
  "KG (Kilograms)",
  "Grams",
  "PCS"
];

const PAYMENT_TERM_OPTIONS = [
  "Cash / COD",
  "NET 7 Days",
  "NET 15 Days",
  "NET 30 Days",
  "NET 45 Days",
  "NET 60 Days",
  "NET 90 Days",
];

const LOCAL_STORAGE_SALES_KEY = "jrc_sales_orders_cache_v1";
const LOCAL_STORAGE_PROD_KEY = "jrc_product_catalog_cache_v1";

export default function SalesPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [availableProducts, setAvailableProducts] = useState<ProductCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  // New Sales Order Form State
  const [customerName, setCustomerName] = useState("");
  const [clientPoRef, setClientPoRef] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [poPhotoUrl, setPoPhotoUrl] = useState<string>("");
  const [paymentTerms, setPaymentTerms] = useState("NET 30 Days");
  const [lineItems, setLineItems] = useState<OrderLineItem[]>([]);

  const loadProducts = async () => {
    let combinedList: ProductCatalogItem[] = [];

    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_PROD_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        combinedList = parsed.map((p: any) => ({
          sku: p.sku,
          name: p.name,
          base_price: Number(p.selling_price) || Number(p.unit_cost) || 0,
          default_uom: p.uom || "PCS",
        }));
      }
    } catch (e) {
      console.error("Local storage product read error:", e);
    }

    try {
      const supabase = createClient();
      const { data } = await supabase.from("products").select("*");
      if (data && data.length > 0) {
        const mappedRemote: ProductCatalogItem[] = data.map((p: any) => ({
          sku: p.sku,
          name: p.name,
          base_price: Number(p.selling_price) || Number(p.unit_cost) || 0,
          default_uom: p.uom || "PCS",
        }));

        const map = new Map<string, ProductCatalogItem>();
        combinedList.forEach((item) => map.set(item.sku, item));
        mappedRemote.forEach((item) => map.set(item.sku, item));
        combinedList = Array.from(map.values());
      }
    } catch (err) {
      console.error("Supabase product fetch error:", err);
    }

    setAvailableProducts(combinedList);
    if (combinedList.length > 0 && lineItems.length === 0) {
      const firstProd = combinedList[0];
      setLineItems([
        {
          id: `line-${Date.now()}`,
          product_sku: firstProd.sku,
          product_name: firstProd.name,
          qty: 1,
          uom: firstProd.default_uom,
          unit_price: firstProd.base_price,
          total_price: firstProd.base_price,
        },
      ]);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);

    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_SALES_KEY);
      if (cached) {
        setOrders(JSON.parse(cached));
      }
    } catch (e) {
      console.error("Local sales read error:", e);
    }

    try {
      const supabase = createClient();
      const { data: dbOrders, error } = await supabase
        .from("sales_orders")
        .select("*, customers(company_name, shipping_address, payment_terms)")
        .order("created_at", { ascending: false });

      if (!error && dbOrders && dbOrders.length > 0) {
        const remoteOrders: SalesOrder[] = dbOrders.map((so: any) => ({
          id: so.id,
          order_number: so.order_number || `SO-2026-${so.id.slice(0, 4)}`,
          customer_name: so.customers?.company_name || "Commercial Client",
          client_po_ref: "EMAIL-PO-ATTACHED",
          delivery_address: typeof so.customers?.shipping_address === "string" 
            ? so.customers.shipping_address 
            : so.customers?.shipping_address?.street || "",
          order_date: so.created_at ? so.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
          total_amount: Number(so.total_amount) || 0,
          status: (so.status as SalesOrder["status"]) || "APPROVED",
          payment_status: (so.payment_status as SalesOrder["payment_status"]) || "UNPAID",
          payment_terms: so.customers?.payment_terms || "NET 30 Days",
          items: [],
        }));

        setOrders(remoteOrders);
      }
    } catch (err) {
      console.error("Notice loading sales orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    fetchOrders();
  }, []);

  const handleAddLineItem = () => {
    if (availableProducts.length === 0) return;
    const firstProd = availableProducts[0];
    const newItem: OrderLineItem = {
      id: `line-${Date.now()}-${Math.random()}`,
      product_sku: firstProd.sku,
      product_name: firstProd.name,
      qty: 1,
      uom: firstProd.default_uom,
      unit_price: firstProd.base_price,
      total_price: firstProd.base_price,
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((i) => i.id !== id));
  };

  const handleUpdateLineItem = (id: string, field: keyof OrderLineItem, value: any) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id !== id) return item;

        let updated = { ...item, [field]: value };

        if (field === "product_sku") {
          const prod = availableProducts.find((p) => p.sku === value);
          if (prod) {
            updated.product_name = prod.name;
            updated.unit_price = prod.base_price;
            updated.uom = prod.default_uom;
          }
        }

        if (field === "qty" || field === "unit_price" || field === "product_sku") {
          const qty = field === "qty" ? Number(value) : updated.qty;
          const price = field === "unit_price" ? Number(value) : updated.unit_price;
          updated.total_price = qty * price;
        }

        return updated;
      })
    );
  };

  const handlePoPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setPoPhotoUrl(reader.result.toString());
      }
    };
    reader.readAsDataURL(file);
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.total_price, 0);
  const vat = subtotal * 0.12;
  const grandTotal = subtotal + vat;

  const handleCreateSalesOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const orderNo = `SO-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: SalesOrder = {
      id: `so-${Date.now()}`,
      order_number: orderNo,
      customer_name: customerName,
      client_po_ref: clientPoRef || "EMAIL-PO-ATTACHED",
      delivery_address: deliveryAddress,
      po_photo_url: poPhotoUrl,
      order_date: new Date().toISOString().split("T")[0],
      total_amount: grandTotal,
      status: "APPROVED",
      payment_status: paymentTerms.startsWith("Cash") ? "PAID" : "UNPAID",
      payment_terms: paymentTerms,
      items: lineItems,
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    try {
      localStorage.setItem(LOCAL_STORAGE_SALES_KEY, JSON.stringify(updatedOrders));
    } catch (e) {
      console.error("Local storage write error:", e);
    }

    setIsModalOpen(false);

    try {
      const supabase = createClient();
      await supabase.from("sales_orders").insert({
        order_number: orderNo,
        status: "APPROVED",
        payment_status: paymentTerms.startsWith("Cash") ? "PAID" : "UNPAID",
        total_amount: grandTotal,
      });
    } catch (err) {
      console.error("Error saving sales order to Supabase:", err);
    }

    setCustomerName("");
    setClientPoRef("");
    setDeliveryAddress("");
    setPoPhotoUrl("");
  };

  const filteredOrders = orders.filter((o) =>
    o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.client_po_ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.delivery_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <RoleGuard allowedRoles={["super_admin", "sales_rep", "finance_manager"]} moduleName="Sales Orders & Commercial Quotes">
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* STICKY TOP NAVIGATION BAR */}
      <TopNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
              <ShoppingCart className="w-7 h-7 text-blue-700" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Sales Orders & Commercial Quotes
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Log customer POs, multi-item line quotes, shipping destinations, and client PO photo attachments
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-500 text-slate-950 font-extrabold text-sm shadow-md shadow-yellow-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 text-slate-950" />
            <span>+ Log New Sales Order</span>
          </button>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search SO #, Customer, or PO Ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* ORDERS LIST */}
        {loading ? (
          <div className="p-12 text-center bg-white border-2 border-slate-200 rounded-2xl text-slate-600 font-bold">
            Loading sales orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white border-2 border-slate-200 rounded-2xl space-y-3 shadow-sm">
            <ShoppingCart className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-900">No Sales Orders Logged Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              Click "+ Log New Sales Order" to create customer quotes, attach PO photos, and transmit to Chemical Production.
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE CARDS VIEW */}
            <div className="block lg:hidden space-y-4">
              {filteredOrders.map((o) => (
                <div key={o.id} className="p-5 rounded-2xl bg-white border-2 border-slate-200 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-extrabold text-blue-700">{o.order_number}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                      {o.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-slate-900">{o.customer_name}</h3>
                    <p className="text-xs text-slate-600 font-mono">Client PO Ref: <span className="text-blue-700 font-bold">{o.client_po_ref}</span></p>
                    {o.delivery_address && (
                      <p className="text-xs text-slate-700 flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{o.delivery_address}</span>
                      </p>
                    )}
                  </div>

                  {o.po_photo_url && (
                    <button
                      onClick={() => setPreviewPhotoUrl(o.po_photo_url || null)}
                      className="w-full py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-4 h-4 text-blue-700" />
                      <span>View Uploaded Client PO Photo</span>
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-500 text-[10px] block font-bold">Grand Total (inc VAT)</span>
                      <span className="font-mono font-extrabold text-slate-900 text-sm">₱{o.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-bold">Payment Terms</span>
                      <span className="font-mono font-extrabold text-emerald-600">{o.payment_terms} ({o.payment_status})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP DATA TABLE */}
            <div className="hidden lg:block p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-xs text-slate-500 uppercase tracking-wider font-extrabold">
                    <th className="py-3 px-3">SO Number</th>
                    <th className="py-3 px-3">Customer Account</th>
                    <th className="py-3 px-3">Client Email PO Ref</th>
                    <th className="py-3 px-3">PO Attachment</th>
                    <th className="py-3 px-3">Delivery Address</th>
                    <th className="py-3 px-3">Terms</th>
                    <th className="py-3 px-3">Total Amount (₱)</th>
                    <th className="py-3 px-3">Workflow Status</th>
                    <th className="py-3 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-extrabold text-blue-700">{o.order_number}</td>
                      <td className="py-3.5 px-3 font-extrabold text-slate-900">{o.customer_name}</td>
                      <td className="py-3.5 px-3 font-mono text-slate-700 font-semibold">{o.client_po_ref}</td>
                      <td className="py-3.5 px-3">
                        {o.po_photo_url ? (
                          <button
                            onClick={() => setPreviewPhotoUrl(o.po_photo_url || null)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-extrabold text-xs flex items-center gap-1.5 shadow-xs"
                            title="View Attached Client PO Photo"
                          >
                            <Camera className="w-3.5 h-3.5 text-blue-700" />
                            <span>View PO Photo</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs italic">No Photo</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 max-w-[200px] truncate font-medium">{o.delivery_address || "—"}</td>
                      <td className="py-3.5 px-3 font-mono text-slate-700 font-semibold">{o.payment_terms}</td>
                      <td className="py-3.5 px-3 font-mono font-extrabold text-slate-900">₱{o.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/documents?type=sales_invoice&so=${encodeURIComponent(o.order_number)}`}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-extrabold text-xs transition-all flex items-center gap-1"
                          >
                            <span>Invoice</span>
                          </Link>
                          <Link
                            href={`/documents?type=delivery_receipt&so=${encodeURIComponent(o.order_number)}`}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-extrabold text-xs transition-all flex items-center gap-1"
                          >
                            <span>DR</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* LOG SALES ORDER MODAL WITH PO PHOTO UPLOAD */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white border-2 border-blue-600 rounded-2xl w-full max-w-2xl p-5 sm:p-6 space-y-5 shadow-2xl my-auto">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-700" />
                  <span>Log Sales Order (Multi-Item, Delivery Address & PO Photo)</span>
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-lg font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSalesOrder} className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Customer Account Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Client Company Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Client Email PO # Ref</label>
                    <input
                      type="text"
                      placeholder="e.g. PO-2026-CLIENT-001"
                      value={clientPoRef}
                      onChange={(e) => setClientPoRef(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 font-semibold focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Payment / Credit Terms</label>
                    <select
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 font-semibold"
                    >
                      {PAYMENT_TERM_OPTIONS.map((term) => (
                        <option key={term} value={term}>
                          {term}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-800 font-extrabold block mb-1 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-700" />
                    <span>Delivery / Shipping Address</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter complete delivery address (Plant site, street, city)..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:border-blue-600"
                  />
                </div>

                {/* CLIENT PO REFERENCE PHOTO UPLOAD FIELD */}
                <div className="p-3 bg-blue-50/50 border-2 border-blue-200 rounded-xl space-y-2">
                  <label className="text-slate-900 font-extrabold block text-xs sm:text-sm flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-blue-700" />
                      <span>Upload Client PO Photo / Attachment Reference</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">Photos / Scans of Official PO</span>
                  </label>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePoPhotoUpload}
                    className="w-full p-2 bg-white border-2 border-slate-200 rounded-xl text-xs text-slate-700 font-semibold file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-extrabold file:bg-amber-400 file:text-slate-950 hover:file:bg-amber-300 cursor-pointer"
                  />

                  {poPhotoUrl && (
                    <div className="flex items-center gap-3 pt-1">
                      <div className="relative inline-block border-2 border-blue-600 rounded-xl overflow-hidden shadow-md">
                        <img src={poPhotoUrl} alt="Client PO Preview" className="h-20 w-auto object-cover" />
                        <button
                          type="button"
                          onClick={() => setPoPhotoUrl("")}
                          className="absolute top-1 right-1 bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md hover:bg-rose-700"
                          title="Remove Photo"
                        >
                          ✕
                        </button>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        ✓ PO Photo Attached for Department Reference
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t-2 border-b-2 border-slate-100 py-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wider">
                      Ordered Line Items ({lineItems.length})
                    </span>
                    {availableProducts.length > 0 && (
                      <button
                        type="button"
                        onClick={handleAddLineItem}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-400 border border-amber-500 text-slate-950 hover:bg-amber-300 text-xs font-extrabold transition-all"
                      >
                        <Plus className="w-4 h-4 text-slate-950" />
                        <span>+ Add Line Item</span>
                      </button>
                    )}
                  </div>

                  {availableProducts.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 border-2 border-slate-200 rounded-xl space-y-2">
                      <Package className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs text-blue-700 font-extrabold">No products in catalog yet.</p>
                      <p className="text-[11px] text-slate-600 font-medium">
                        Go to <Link href="/products" className="text-blue-700 underline font-bold">Product Catalog Master</Link> to add chemical products and variant prices first.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {lineItems.map((item, index) => (
                        <div key={item.id} className="p-3 sm:p-4 rounded-xl bg-slate-50 border-2 border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-600">Item #{index + 1}</span>
                            {lineItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveLineItem(item.id)}
                                className="text-rose-600 hover:text-rose-700 p-1 font-bold"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div>
                            <label className="text-slate-800 block mb-1 text-xs font-extrabold">Select Product Item & Variant from Catalog</label>
                            <select
                              value={item.product_sku}
                              onChange={(e) => handleUpdateLineItem(item.id, "product_sku", e.target.value)}
                              className="w-full p-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold"
                            >
                              {availableProducts.map((p) => (
                                <option key={p.sku} value={p.sku}>
                                  {p.name} ({p.sku} — ₱{p.base_price.toFixed(2)} / {p.default_uom})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-slate-800 block mb-1 text-xs font-extrabold">Quantity</label>
                              <input
                                type="number"
                                min="1"
                                required
                                value={item.qty}
                                onChange={(e) => handleUpdateLineItem(item.id, "qty", e.target.value)}
                                className="w-full p-2 bg-white border-2 border-slate-200 rounded-xl text-xs font-mono font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-slate-800 block mb-1 text-xs font-extrabold">Unit of Measure (UOM)</label>
                              <select
                                value={item.uom}
                                onChange={(e) => handleUpdateLineItem(item.id, "uom", e.target.value)}
                                className="w-full p-2 bg-white border-2 border-slate-200 rounded-xl text-xs font-semibold"
                              >
                                {UOM_OPTIONS.map((u) => (
                                  <option key={u} value={u}>
                                    {u}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-slate-800 block mb-1 text-xs font-extrabold">Item Subtotal (₱)</label>
                              <div className="p-2 bg-blue-50 border-2 border-blue-200 rounded-xl font-mono font-extrabold text-blue-900 text-xs flex items-center justify-end">
                                ₱{item.total_price.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ORDER TOTAL SUMMARY */}
                <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-1.5 font-mono text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span>Line Items Subtotal:</span>
                    <span className="font-bold">₱{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (12% Philippine Tax):</span>
                    <span className="font-bold">₱{vat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base font-extrabold text-blue-700 pt-2 border-t border-slate-200">
                    <span>Grand Total:</span>
                    <span>₱{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-extrabold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 border border-amber-500 text-slate-950 text-xs font-extrabold shadow-md"
                  >
                    Transmit Order Across Departments
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PO PHOTO PREVIEW MODAL */}
        {previewPhotoUrl && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-[120] flex items-center justify-center p-4">
            <div className="bg-white border-2 border-blue-600 rounded-2xl max-w-2xl w-full p-4 space-y-3 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-sm font-extrabold text-blue-700 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <span>Client Official Purchase Order (PO) Photo Reference</span>
                </span>
                <button
                  onClick={() => setPreviewPhotoUrl(null)}
                  className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-[75vh] overflow-y-auto rounded-xl border border-slate-200 p-2 bg-slate-50 flex items-center justify-center">
                <img src={previewPhotoUrl} alt="Client PO Reference" className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm" />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
    </RoleGuard>
  );
}
