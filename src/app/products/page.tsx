"use client";

import React, { useState, useEffect } from "react";
import { Package, Plus, Search, Wand2, Trash2, Edit, Building2, ShoppingBag, Truck } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TopNavbar } from "@/components/Navigation/TopNavbar";
import { OrderTaskView } from "@/components/Orders/OrderTaskView";

interface Product {
  id: string;
  sku: string;
  name: string;
  variant_scent: string;
  category: "raw_material" | "finished_chemical" | "packaging" | "pest_control_supply";
  uom: string;
  min_reorder_level: number;
  current_stock: number;
  unit_cost: number;
  selling_price: number;
  supplier_name?: string;
  supplier_price?: number;
}

interface FormulaIngredientItem {
  raw_material_sku: string;
  name: string;
  ratio_qty: number;
  uom: string;
}

const LOCAL_STORAGE_KEY = "jrc_product_catalog_cache_v1";
const LOCAL_STORAGE_RECIPES_KEY = "jrc_recipes_cache_v1";

import PrintableSDS from "@/components/documents/PrintableSDS";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  
  // SDS MODAL STATE FOR MARKETING
  const [selectedSdsProduct, setSelectedSdsProduct] = useState<Product | null>(null);

  // MODAL STATES
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isSalesProdModalOpen, setIsSalesProdModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // SUPPLIER RAW MATERIAL FORM STATE
  const [supplierMatSku, setSupplierMatSku] = useState("");
  const [supplierMatName, setSupplierMatName] = useState("");
  const [supplierCategory, setSupplierCategory] = useState<Product["category"]>("raw_material");
  const [supplierVendorName, setSupplierVendorName] = useState("");
  const [supplierUnitPrice, setSupplierUnitPrice] = useState<number>(0);
  const [supplierUom, setSupplierUom] = useState("KG");

  // FINISHED SALES PRODUCT FORM STATE
  const [salesProdSku, setSalesProdSku] = useState("");
  const [salesProdName, setSalesProdName] = useState("");
  const [salesProdVariant, setSalesProdVariant] = useState("Standard / Unscented");
  const [salesSellingPrice, setSalesSellingPrice] = useState<number>(0);
  const [salesUnitCost, setSalesUnitCost] = useState<number>(0);
  const [salesUom, setSalesUom] = useState("Drum (200L)");
  const [salesIngredients, setSalesIngredients] = useState<FormulaIngredientItem[]>([]);

  const rawMaterialsList = products.filter(
    (p) => p.category === "raw_material" || p.category === "packaging"
  );

  const handleAddSalesIngredient = () => {
    const firstRm = rawMaterialsList[0] || products[0];
    const defaultSku = firstRm?.sku || "RM-001";
    const defaultName = firstRm?.name || "Supplier Raw Material";
    setSalesIngredients([
      ...salesIngredients,
      { raw_material_sku: defaultSku, name: defaultName, ratio_qty: 10, uom: "KG" },
    ]);
  };

  const handleRemoveSalesIngredient = (index: number) => {
    setSalesIngredients(salesIngredients.filter((_, i) => i !== index));
  };

  const handleUpdateSalesIngredient = (index: number, field: keyof FormulaIngredientItem, value: any) => {
    setSalesIngredients(
      salesIngredients.map((ing, i) => {
        if (i === index) {
          const updated = { ...ing, [field]: value };
          if (field === "raw_material_sku") {
            const p = products.find((item) => item.sku === value);
            if (p) {
              updated.name = p.name;
              updated.uom = p.uom || "KG";
            }
          }
          return updated;
        }
        return ing;
      })
    );
  };

  const fetchProducts = async () => {
    let cachedList: Product[] = [];
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        cachedList = JSON.parse(stored);
        setProducts(cachedList);
      }
    } catch (e) {
      console.error("Local storage error:", e);
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        const remoteList = data.map((p: any) => ({
          id: p.id || `p-${p.sku}`,
          sku: p.sku,
          name: p.name,
          variant_scent: p.variant_scent || "Standard",
          category: p.category,
          uom: p.uom,
          min_reorder_level: Number(p.min_reorder_level) || 10,
          current_stock: Number(p.current_stock) || 0,
          unit_cost: Number(p.unit_cost) || 0,
          selling_price: Number(p.selling_price) || 0,
          supplier_name: p.supplier_name || "Chemical Vendor",
          supplier_price: Number(p.supplier_price || p.unit_cost) || 0,
        }));

        const combinedMap = new Map<string, Product>();
        cachedList.forEach((p) => combinedMap.set(p.sku, p));
        remoteList.forEach((p) => combinedMap.set(p.sku, p));
        const combined = Array.from(combinedMap.values());
        setProducts(combined);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(combined));
      }
    } catch (err) {
      console.error("Notice loading products from Supabase:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (sku: string) => {
    if (!confirm(`Are you sure you want to delete SKU "${sku}" from the catalog?`)) return;

    const updated = products.filter((p) => p.sku !== sku);
    setProducts(updated);

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Local storage delete error:", e);
    }

    try {
      const supabase = createClient();
      const { error: delErr } = await supabase.from("products").delete().eq("sku", sku);
      if (delErr) {
        console.warn("Supabase product delete notice:", delErr.message);
        alert(`Notice: SKU "${sku}" removed locally. (${delErr.message})`);
      }
    } catch (err) {
      console.error("Supabase product delete error:", err);
    }
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct({ ...prod });
    setIsEditModalOpen(true);
  };

  const handleSaveEditedProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updatedList = products.map((p) => (p.sku === editingProduct.sku ? editingProduct : p));
    setProducts(updatedList);

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (err) {
      console.error("Local storage edit error:", err);
    }

    setIsEditModalOpen(false);

    try {
      const supabase = createClient();
      await supabase.from("products").update({
        name: editingProduct.name,
        category: editingProduct.category,
        uom: editingProduct.uom,
        unit_cost: editingProduct.unit_cost,
        selling_price: editingProduct.selling_price,
        supplier_name: editingProduct.supplier_name,
        supplier_price: editingProduct.supplier_price,
      }).eq("sku", editingProduct.sku);
    } catch (err) {
      console.error("Supabase product edit notice:", err);
    }

    setEditingProduct(null);
  };

  const generateSkuFromName = (productName: string, cat: Product["category"], variant: string) => {
    if (!productName.trim()) return "";
    
    const categoryPrefixMap: Record<Product["category"], string> = {
      raw_material: "RM",
      finished_chemical: "FG",
      packaging: "PK",
      pest_control_supply: "PC",
    };

    const prefix = categoryPrefixMap[cat] || "PRD";

    const words = productName.trim().split(/\s+/).filter(Boolean);
    let nameCode = "";
    if (words.length === 1) {
      nameCode = words[0].substring(0, 4).toUpperCase();
    } else {
      nameCode = words.map((w) => w[0]).join("").toUpperCase().substring(0, 4);
    }

    let scentCode = "";
    if (variant && variant !== "Standard / Unscented") {
      scentCode = `-${variant.substring(0, 3).toUpperCase()}`;
    }

    const numbersMatch = productName.match(/\d+/);
    const numPart = numbersMatch ? `-${numbersMatch[0]}` : "";

    return `${prefix}-${nameCode}${scentCode}${numPart}`;
  };

  const handleSaveSupplierMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSku = supplierMatSku || generateSkuFromName(supplierMatName, supplierCategory, "") || `RM-${Date.now()}`;

    const newProd: Product = {
      id: `p-${Date.now()}`,
      sku: finalSku,
      name: supplierMatName,
      variant_scent: "Standard",
      category: supplierCategory,
      uom: supplierUom,
      min_reorder_level: 10,
      current_stock: 0,
      unit_cost: supplierUnitPrice,
      selling_price: 0,
      supplier_name: supplierVendorName || "Chemical Distributor",
      supplier_price: supplierUnitPrice,
    };

    const updated = [newProd, ...products];
    setProducts(updated);

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Local storage save error:", err);
    }

    setIsSupplierModalOpen(false);

    try {
      const supabase = createClient();
      await supabase.from("products").upsert({
        sku: newProd.sku,
        name: newProd.name,
        category: newProd.category,
        uom: newProd.uom,
        unit_cost: newProd.unit_cost,
        selling_price: 0,
        supplier_name: newProd.supplier_name,
        supplier_price: newProd.supplier_price,
      }, { onConflict: "sku" });
    } catch (err) {
      console.error("Supabase insert error:", err);
    }

    setSupplierMatSku("");
    setSupplierMatName("");
    setSupplierVendorName("");
    setSupplierUnitPrice(0);
  };

  const handleSaveSalesProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSku = salesProdSku || generateSkuFromName(salesProdName, "finished_chemical", salesProdVariant) || `FG-${Date.now()}`;
    const fullName = salesProdVariant && salesProdVariant !== "Standard / Unscented" ? `${salesProdName} (${salesProdVariant})` : salesProdName;

    const newProd: Product = {
      id: `p-${Date.now()}`,
      sku: finalSku,
      name: fullName,
      variant_scent: salesProdVariant || "Standard",
      category: "finished_chemical",
      uom: salesUom,
      min_reorder_level: 10,
      current_stock: 0,
      unit_cost: salesUnitCost,
      selling_price: salesSellingPrice,
      supplier_name: "JRC In-House Production",
      supplier_price: salesUnitCost,
    };

    const updated = [newProd, ...products];
    setProducts(updated);

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Local storage save error:", err);
    }

    // Also save corresponding chemical BoM recipe if ingredients added
    if (salesIngredients.length > 0) {
      const newRecipe = {
        id: `bom-${Date.now()}`,
        finished_product_sku: finalSku,
        finished_product_name: fullName,
        batch_yield_qty: 1,
        batch_yield_uom: salesUom,
        version: "v1.0",
        ingredients: salesIngredients,
      };

      try {
        const storedRecs = localStorage.getItem(LOCAL_STORAGE_RECIPES_KEY);
        const parsedRecs = storedRecs ? JSON.parse(storedRecs) : [];
        localStorage.setItem(LOCAL_STORAGE_RECIPES_KEY, JSON.stringify([newRecipe, ...parsedRecs]));
      } catch (err) {}
    }

    setIsSalesProdModalOpen(false);

    try {
      const supabase = createClient();
      await supabase.from("products").upsert({
        sku: newProd.sku,
        name: newProd.name,
        category: newProd.category,
        uom: newProd.uom,
        unit_cost: newProd.unit_cost,
        selling_price: newProd.selling_price,
        supplier_name: newProd.supplier_name,
        supplier_price: newProd.supplier_price,
      }, { onConflict: "sku" });
    } catch (err) {
      console.error("Supabase insert error:", err);
    }

    setSalesProdSku("");
    setSalesProdName("");
    setSalesSellingPrice(0);
    setSalesUnitCost(0);
    setSalesIngredients([]);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.supplier_name && p.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "ALL" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* STICKY TOP NAVIGATION BAR */}
      <TopNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* HEADER WITH DUAL DISTINCT ACTION BUTTONS */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
              <Package className="w-7 h-7 text-blue-700" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Marketing & Product Catalog</h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Manage SKUs, supplier items & supplier prices, unit costs, and selling prices</p>
            </div>
          </div>

          {/* TWO SEPARATE PRODUCT CREATION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={() => setIsSupplierModalOpen(true)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
            >
              <Truck className="w-4.5 h-4.5 text-slate-950" />
              <span>+ Add Supplier Raw Material</span>
            </button>

            <button
              onClick={() => setIsSalesProdModalOpen(true)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-extrabold text-xs sm:text-sm shadow-md ring-2 ring-amber-400 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4.5 h-4.5 text-white" />
              <span>+ Add Finished Product for Sale</span>
            </button>
          </div>
        </div>

        {/* TASK-ORIENTED SYNCHRONIZED ORDER WORKSPACE FOR MARKETING */}
        <OrderTaskView activeDepartment="Marketing" employeeName="Marketing Specialist" />

        {/* SEARCH & FILTERS FOR CATALOG */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search SKU, Name, or Supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {["ALL", "raw_material", "finished_chemical", "packaging", "pest_control_supply"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-blue-700 text-white border-2 border-amber-400 shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-blue-50 border border-slate-200"
                }`}
              >
                {cat.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* EMPTY STATE OR CARDS VIEW */}
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white border-2 border-slate-200 rounded-2xl space-y-3 shadow-sm">
            <Package className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-900">No Products in Catalog</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              Use "+ Add Supplier Raw Material" or "+ Add Finished Product for Sale" to add catalog items.
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE PRODUCT CARDS */}
            <div className="block lg:hidden space-y-4">
              {filteredProducts.map((p) => (
                <div key={p.sku} className="p-5 rounded-2xl bg-white border-2 border-slate-200 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-extrabold text-blue-700">{p.sku}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.sku)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">{p.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">Supplier: <strong className="text-slate-800">{p.supplier_name || "Chemical Vendor"}</strong></p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold">UOM</span>
                      <span className="font-mono font-bold text-slate-800">{p.uom}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold">Supplier Price</span>
                      <span className="font-mono font-bold text-amber-700">₱{p.supplier_price?.toFixed(2) || p.unit_cost?.toFixed(2) || "0.00"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold">Selling Price</span>
                      <span className="font-mono font-extrabold text-blue-700">₱{p.selling_price?.toFixed(2) || "0.00"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP DATA TABLE WITH EDIT & DELETE */}
            <div className="hidden lg:block p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-xs text-slate-500 uppercase tracking-wider font-extrabold">
                    <th className="py-3 px-3">SKU Code</th>
                    <th className="py-3 px-3">Product Description</th>
                    <th className="py-3 px-3">Supplier Name</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">UOM</th>
                    <th className="py-3 px-3">Supplier Price (₱)</th>
                    <th className="py-3 px-3">Selling Price (₱)</th>
                    <th className="py-3 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                  {filteredProducts.map((p) => (
                    <tr key={p.sku} className="hover:bg-blue-50/50 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-extrabold text-blue-700">{p.sku}</td>
                      <td className="py-3.5 px-3 font-extrabold text-slate-900">{p.name}</td>
                      <td className="py-3.5 px-3 font-semibold text-slate-700">{p.supplier_name || "Chemical Vendor"}</td>
                      <td className="py-3.5 px-3 uppercase text-xs font-extrabold text-slate-500">{p.category.replace("_", " ")}</td>
                      <td className="py-3.5 px-3 font-mono font-semibold">{p.uom}</td>
                      <td className="py-3.5 px-3 font-mono font-bold text-amber-700">₱{p.supplier_price?.toFixed(2) || p.unit_cost?.toFixed(2) || "0.00"}</td>
                      <td className="py-3.5 px-3 font-mono font-extrabold text-blue-800">₱{p.selling_price?.toFixed(2) || "0.00"}</td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedSdsProduct(p)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 border border-amber-500 text-slate-950 font-black text-xs shadow-xs active:scale-95 transition-all"
                            title="Generate GHS Safety Data Sheet for this product"
                          >
                            <Wand2 className="w-3.5 h-3.5 text-slate-950" />
                            <span>Generate SDS</span>
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-extrabold text-xs transition-all"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit Prices</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.sku)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-extrabold text-xs transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* MODAL 1: ADD SUPPLIER RAW MATERIAL */}
        {isSupplierModalOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white border-2 border-amber-500 rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl my-auto">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-600" />
                  <span>Add Supplier Raw Material / Packaging</span>
                </h3>
                <button onClick={() => setIsSupplierModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-lg font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveSupplierMaterial} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="text-slate-800 font-extrabold block mb-1">Raw Material Description / Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Isopropyl Alcohol 99% Grade A"
                    value={supplierMatName}
                    onChange={(e) => {
                      setSupplierMatName(e.target.value);
                      if (!supplierMatSku) {
                        setSupplierMatSku(generateSkuFromName(e.target.value, supplierCategory, ""));
                      }
                    }}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-800 font-extrabold block">SKU Code</label>
                      <button
                        type="button"
                        onClick={() => setSupplierMatSku(generateSkuFromName(supplierMatName, supplierCategory, ""))}
                        className="text-[10px] text-amber-700 hover:underline font-extrabold flex items-center gap-1"
                      >
                        <Wand2 className="w-3 h-3" /> Auto
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="RM-ISOP-99"
                      value={supplierMatSku}
                      onChange={(e) => setSupplierMatSku(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-mono font-extrabold text-blue-700"
                    />
                  </div>

                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Category</label>
                    <select
                      value={supplierCategory}
                      onChange={(e) => setSupplierCategory(e.target.value as Product["category"])}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                    >
                      <option value="raw_material">Raw Material</option>
                      <option value="packaging">Packaging & Containers</option>
                      <option value="pest_control_supply">Pest Control Supply</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Supplier Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Metro Chemical Distributors"
                      value={supplierVendorName}
                      onChange={(e) => setSupplierVendorName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Unit</label>
                    <input
                      type="text"
                      required
                      placeholder="Drum (200L), KG, Liters..."
                      value={supplierUom}
                      onChange={(e) => setSupplierUom(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-mono text-slate-900 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-800 font-extrabold block mb-1">Supplier Unit Price (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="18500.00"
                    value={supplierUnitPrice}
                    onChange={(e) => setSupplierUnitPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-mono font-extrabold text-amber-800"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSupplierModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-extrabold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 border border-amber-500 text-slate-950 text-xs font-extrabold shadow-md"
                  >
                    Save Supplier Raw Material
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: ADD FINISHED PRODUCT FOR SALE & EMBEDDED FORMULA */}
        {isSalesProdModalOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white border-2 border-blue-600 rounded-2xl w-full max-w-2xl p-5 sm:p-6 space-y-4 shadow-2xl my-auto">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-700" />
                  <span>Log Finished Product & Formula</span>
                </h3>
                <button onClick={() => setIsSalesProdModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-lg font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveSalesProduct} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="text-slate-800 font-extrabold block mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Heavy Duty Industrial Degreaser"
                    value={salesProdName}
                    onChange={(e) => {
                      setSalesProdName(e.target.value);
                      if (!salesProdSku) {
                        setSalesProdSku(generateSkuFromName(e.target.value, "finished_chemical", salesProdVariant));
                      }
                    }}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Variant / Scent</label>
                    <input
                      type="text"
                      placeholder="e.g. Lemon Fresh, Standard"
                      value={salesProdVariant}
                      onChange={(e) => {
                        setSalesProdVariant(e.target.value);
                        setSalesProdSku(generateSkuFromName(salesProdName, "finished_chemical", e.target.value));
                      }}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-800 font-extrabold block">SKU Code</label>
                      <button
                        type="button"
                        onClick={() => setSalesProdSku(generateSkuFromName(salesProdName, "finished_chemical", salesProdVariant))}
                        className="text-[10px] text-blue-700 hover:underline font-extrabold flex items-center gap-1"
                      >
                        <Wand2 className="w-3 h-3" /> Auto
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="FG-DEGR-500"
                      value={salesProdSku}
                      onChange={(e) => setSalesProdSku(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-mono font-extrabold text-blue-700 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Unit</label>
                    <select
                      value={salesUom}
                      onChange={(e) => setSalesUom(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                    >
                      <option value="Drum (200L)">Drum (200L)</option>
                      <option value="Pail (20L)">Pail (20L)</option>
                      <option value="Gallon (4L)">Gallon (4L)</option>
                      <option value="Bottle (1L)">Bottle (1L)</option>
                      <option value="L (Liters)">L (Liters)</option>
                      <option value="KG (Kilograms)">KG (Kilograms)</option>
                      <option value="PCS">PCS</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Selling Price (₱)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="25000.00"
                      value={salesSellingPrice || ""}
                      onChange={(e) => setSalesSellingPrice(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-mono font-extrabold text-blue-700 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* FORMULA SECTION */}
                <div className="border-t-2 border-b-2 border-slate-100 py-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wider block">
                        Formula (Bill of Materials)
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">Select ingredients from Supplier Raw Materials</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSalesIngredient}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 border border-amber-500 text-slate-950 font-extrabold text-xs shadow-xs active:scale-95 transition-all"
                    >
                      + Add Ingredient
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {salesIngredients.map((ing, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Ingredient #{idx + 1} (Supplier Raw Material)</label>
                          <select
                            value={ing.raw_material_sku}
                            onChange={(e) => handleUpdateSalesIngredient(idx, "raw_material_sku", e.target.value)}
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                          >
                            {rawMaterialsList.length > 0 ? (
                              rawMaterialsList.map((p) => (
                                <option key={p.sku} value={p.sku}>
                                  {p.name} ({p.sku})
                                </option>
                              ))
                            ) : (
                              <option value="RM-001">Supplier Raw Material (RM-001)</option>
                            )}
                          </select>
                        </div>

                        <div className="w-24">
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Qty / Volume</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={ing.ratio_qty}
                            onChange={(e) => handleUpdateSalesIngredient(idx, "ratio_qty", Number(e.target.value))}
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-right text-slate-900"
                          />
                        </div>

                        <div className="w-24">
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Unit</label>
                          <select
                            value={ing.uom}
                            onChange={(e) => handleUpdateSalesIngredient(idx, "uom", e.target.value)}
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
                          >
                            <option value="Liters">Liters</option>
                            <option value="KG">KG</option>
                            <option value="Grams">Grams</option>
                            <option value="mL">mL</option>
                            <option value="PCS">PCS</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveSalesIngredient(idx)}
                          className="p-1.5 text-rose-600 hover:text-rose-700 font-bold self-end"
                          title="Remove ingredient"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSalesProdModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-extrabold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-extrabold shadow-md active:scale-95 transition-all"
                  >
                    Save Finished Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: EDIT PRODUCT (EDITABLE BY FINANCE & SALES) */}
        {isEditModalOpen && editingProduct && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white border-2 border-blue-600 rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-5 shadow-2xl my-auto">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Edit className="w-5 h-5 text-blue-700" />
                  <span>Edit Product & Supplier Prices ({editingProduct.sku})</span>
                </h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-lg font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveEditedProduct} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="text-slate-800 font-extrabold block mb-1">Product Description / Name</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Supplier Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Metro Chemical Supplies"
                      value={editingProduct.supplier_name || ""}
                      onChange={(e) => setEditingProduct({ ...editingProduct, supplier_name: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">UOM</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.uom}
                      onChange={(e) => setEditingProduct({ ...editingProduct, uom: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-mono text-slate-900 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Current Supplier Price (₱)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editingProduct.supplier_price || editingProduct.unit_cost}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          supplier_price: Number(e.target.value),
                          unit_cost: Number(e.target.value),
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-mono font-extrabold text-amber-700"
                    />
                  </div>
                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Full Selling Price (₱)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editingProduct.selling_price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, selling_price: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-mono font-extrabold text-blue-700"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-extrabold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-extrabold shadow-md ring-2 ring-amber-400"
                  >
                    Save Supplier & Price Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PRINTABLE SDS MODAL FOR MARKETING */}
        {selectedSdsProduct && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 p-3 sm:p-6 overflow-y-auto flex items-center justify-center">
            <div className="w-full max-w-5xl my-auto">
              <PrintableSDS
                productName={selectedSdsProduct.name}
                productSku={selectedSdsProduct.sku}
                category={selectedSdsProduct.category === "finished_chemical" ? "Industrial Chemical Formulation" : "Chemical Raw Material"}
                onClose={() => setSelectedSdsProduct(null)}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
