"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart, Plus, Search, Trash2, MapPin, ArrowRight, Package } from "lucide-react";
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

const LOCAL_STORAGE_PRODUCTS_KEY = "jrc_products_cache_v1";
const LOCAL_STORAGE_SALES_KEY = "jrc_sales_orders_cache_v1";

export default function SalesPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [availableProducts, setAvailableProducts] = useState<ProductCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Clean Blank Initial Form State
  const [customerName, setCustomerName] = useState("");
  const [clientPoRef, setClientPoRef] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("NET 30 Days");

  // Multi Line Items State
  const [lineItems, setLineItems] = useState<OrderLineItem[]>([]);

  // Load Catalog Products dynamically from local storage & Supabase
  const loadProductCatalog = async () => {
    let combinedList: ProductCatalogItem[] = [];

    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
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

    if (combinedList.length > 0) {
      const firstProd = combinedList[0];
      setLineItems([
        {
          id: `item-${Date.now()}`,
          product_sku: firstProd.sku,
          product_name: firstProd.name,
          qty: 1,
          uom: firstProd.default_uom,
          unit_price: firstProd.base_price,
          total_price: firstProd.base_price,
        },
      ]);
    } else {
      setLineItems([]);
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
      console.error("Sales cache error:", e);
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("sales_orders").select("*").order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        const formatted: SalesOrder[] = data.map((o) => ({
          id: o.id,
          order_number: o.order_number || `SO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          customer_name: o.customer_name || "Account",
          client_po_ref: o.client_po_ref || "PO-CLIENT",
          delivery_address: o.delivery_address || "",
          order_date: new Date(o.created_at || Date.now()).toISOString().split("T")[0],
          total_amount: Number(o.total_amount) || 0,
          status: o.status || "APPROVED",
          payment_status: o.payment_status || "UNPAID",
          payment_terms: o.payment_terms || "NET 30 Days",
          items: [],
        }));
        setOrders(formatted);
        localStorage.setItem(LOCAL_STORAGE_SALES_KEY, JSON.stringify(formatted));
      }
    } catch (err) {
      console.error("Notice loading sales orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    loadProductCatalog();
  }, []);

  // Multi-item handlers
  const handleAddLineItem = () => {
    if (availableProducts.length === 0) return;
    const defaultProd = availableProducts[0];
    const newItem: OrderLineItem = {
      id: `item-${Date.now()}`,
      product_sku: defaultProd.sku,
      product_name: defaultProd.name,
      qty: 1,
      uom: defaultProd.default_uom,
      unit_price: defaultProd.base_price,
      total_price: defaultProd.base_price,
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const handleUpdateLineItem = (id: string, field: keyof OrderLineItem, value: any) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          
          if (field === "product_sku") {
            const prod = availableProducts.find((p) => p.sku === value);
            if (prod) {
              updated.product_name = prod.name;
              updated.uom = prod.default_uom;
              updated.unit_price = prod.base_price;
            }
          }

          updated.total_price = updated.qty * updated.unit_price;
          return updated;
        }
        return item;
      })
    );
  };

  // Financial Calculations
  const subtotal = lineItems.reduce((acc, item) => acc + item.total_price, 0);
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
        {/* PAGE HEADER - LIGHT MODE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
              <ShoppingCart className="w-7 h-7 text-blue-700" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Sales Department (Order Pipeline)</h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Log client POs with delivery addresses, dynamic catalog SKUs, and credit terms</p>
            </div>
          </div>

          <button
            onClick={() => {
              loadProductCatalog();
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-500 text-slate-950 font-extrabold text-sm shadow-md shadow-yellow-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 text-slate-950" />
            <span>New Sales Order (From Email PO)</span>
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Sales Order #, Client PO Ref, Delivery Address, or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>
        </div>

        {/* EMPTY STATE OR CARDS VIEW */}
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white border-2 border-slate-200 rounded-2xl space-y-3 shadow-sm">
            <ShoppingCart className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-900">No Sales Orders Logged Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              Click "+ New Sales Order (From Email PO)" to enter your customer's PO reference, delivery address, and ordered chemical products.
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
                    <th className="py-3 px-3">Delivery Address</th>
                    <th className="py-3 px-3">Terms</th>
                    <th className="py-3 px-3">Total Amount (₱)</th>
                    <th className="py-3 px-3">Workflow Status</th>
                    <th className="py-3 px-3">Payment</th>
                    <th className="py-3 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-extrabold text-blue-700">{o.order_number}</td>
                      <td className="py-3.5 px-3 font-extrabold text-slate-900">{o.customer_name}</td>
                      <td className="py-3.5 px-3 font-mono text-slate-700 font-semibold">{o.client_po_ref}</td>
                      <td className="py-3.5 px-3 text-slate-600 max-w-[200px] truncate font-medium">{o.delivery_address || "—"}</td>
                      <td className="py-3.5 px-3 font-mono text-slate-700 font-semibold">{o.payment_terms}</td>
                      <td className="py-3.5 px-3 font-mono font-extrabold text-slate-900">₱{o.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-300">
                          {o.payment_status}
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

        {/* DYNAMIC MULTI-ITEM SALES ORDER MODAL - LIGHT MODE */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white border-2 border-blue-600 rounded-2xl w-full max-w-3xl p-5 sm:p-6 space-y-5 shadow-2xl my-auto">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-700" />
                  <span>Log Sales Order (Multi-Item, Delivery Address & Terms)</span>
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-lg font-bold">✕</button>
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
                      required
                      placeholder="e.g. PO-2026-CLIENT-001"
                      value={clientPoRef}
                      onChange={(e) => setClientPoRef(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-mono focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Payment / Credit Terms</label>
                    <select
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold"
                    >
                      {PAYMENT_TERM_OPTIONS.map((term) => (
                        <option key={term} value={term}>{term}</option>
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
                        Go to <Link href="/products" className="text-blue-700 underline font-bold">Product Catalog Master</Link> to add your chemical products and scent variants first.
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

                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-slate-700 block mb-1 text-xs font-extrabold">Quantity</label>
                              <input
                                type="number"
                                min="1"
                                value={item.qty}
                                onChange={(e) => handleUpdateLineItem(item.id, "qty", Number(e.target.value))}
                                className="w-full p-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-mono font-extrabold text-slate-900"
                              />
                            </div>

                            <div>
                              <label className="text-slate-700 block mb-1 text-xs font-extrabold">Unit of Measure (UOM)</label>
                              <select
                                value={item.uom}
                                onChange={(e) => handleUpdateLineItem(item.id, "uom", e.target.value)}
                                className="w-full p-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-semibold"
                              >
                                {UOM_OPTIONS.map((uom) => (
                                  <option key={uom} value={uom}>{uom}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-slate-700 block mb-1 text-xs font-extrabold">Item Subtotal (₱)</label>
                              <div className="p-2.5 bg-blue-50 border-2 border-blue-200 rounded-xl text-xs font-mono font-extrabold text-blue-800 text-right">
                                ₱{item.total_price.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* FINANCIAL SUMMARY */}
                  <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-200 space-y-1.5 font-mono text-xs sm:text-sm">
                    <div className="flex justify-between text-slate-700 font-semibold">
                      <span>Line Items Subtotal:</span>
                      <span>₱{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-700 font-semibold">
                      <span>VAT (12% Philippine Tax):</span>
                      <span>₱{vat.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-blue-800 font-extrabold text-base border-t-2 border-slate-200 pt-2">
                      <span>Grand Total:</span>
                      <span>₱{grandTotal.toFixed(2)}</span>
                    </div>
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
                    disabled={availableProducts.length === 0}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 border border-amber-500 text-slate-950 text-xs font-extrabold shadow-md disabled:opacity-50"
                  >
                    Transmit Order Across Departments
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      </div>
    </RoleGuard>
  );
}
