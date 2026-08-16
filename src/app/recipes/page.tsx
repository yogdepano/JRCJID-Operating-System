"use client";

import React, { useState, useEffect } from "react";
import { FlaskConical, Plus, Scale, Factory, CheckCircle2, Clock, Trash2, Edit, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TopNavbar } from "@/components/Navigation/TopNavbar";
import { RoleGuard } from "@/components/Auth/RoleGuard";
import { OrderTaskView } from "@/components/Orders/OrderTaskView";
import { ComboboxInput } from "@/components/ui/ComboboxInput";
import { ProductFormulaEditor, ProductFormData, SizeFormula, FormulaIngredientItem } from "@/components/Products/ProductFormulaEditor";

interface IngredientItem {
  raw_material_sku: string;
  name: string;
  ratio_qty: number;
  uom: string;
}

interface BoMRecipe {
  id: string;
  finished_product_sku: string;
  finished_product_name: string;
  batch_yield_qty: number;
  batch_yield_uom: string;
  version: string;
  ingredients: IngredientItem[];
  retail_price?: number;
}

const LOCAL_STORAGE_RECIPES_KEY = "jrc_recipes_cache_v1";
const LOCAL_STORAGE_PRODUCTS_KEY = "jrc_products_cache_v1";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<BoMRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<BoMRecipe | null>(null);
  const [targetBatchQty, setTargetBatchQty] = useState<number>(1000);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [editingFormData, setEditingFormData] = useState<Partial<ProductFormData> | null>(null);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);

  // FORM STATE FOR NEW FINISHED PRODUCT & EMBEDDED FORMULA
  const [productName, setProductName] = useState("");
  const [productVariant, setProductVariant] = useState("Standard");
  const [productSku, setProductSku] = useState("");
  const [productUnit, setProductUnit] = useState("Drum (200L)");
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [formIngredients, setFormIngredients] = useState<IngredientItem[]>([]);

  // Load raw materials from Supabase & cache
  const loadData = async () => {
    let prods: any[] = [];
    try {
      const storedProds = localStorage.getItem("jrc_product_catalog_cache_v1") || localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
      if (storedProds) {
        prods = JSON.parse(storedProds);
      }
    } catch (e) {}

    try {
      const supabase = createClient();
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (data && data.length > 0) {
        prods = data;
      }
    } catch (err) {}

    setAvailableProducts(prods);

    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_RECIPES_KEY);
      if (stored) {
        const parsed: BoMRecipe[] = JSON.parse(stored);
        setRecipes(parsed);
        if (parsed.length > 0) {
          setSelectedRecipe(parsed[0]);
          setTargetBatchQty(parsed[0].batch_yield_qty * 2);
        }
      }
    } catch (e) {
      console.error("Recipes cache error:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const rawMaterialsList = availableProducts.filter(
    (p) => !p.category || p.category === "raw_material" || p.category === "packaging"
  );

  const handleAddIngredient = () => {
    const firstRm = rawMaterialsList[0] || availableProducts[0];
    const defaultSku = firstRm?.sku || "RM-001";
    const defaultName = firstRm?.name || "Supplier Raw Material";
    setFormIngredients([
      ...formIngredients,
      { raw_material_sku: defaultSku, name: defaultName, ratio_qty: 10, uom: "KG" },
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    setFormIngredients(formIngredients.filter((_, i) => i !== index));
  };

  const handleUpdateIngredient = (index: number, field: keyof IngredientItem, value: any) => {
    setFormIngredients(
      formIngredients.map((ing, i) => {
        if (i === index) {
          const updated = { ...ing, [field]: value };
          if (field === "name" || field === "raw_material_sku") {
            const p = availableProducts.find(
              (item) => item.sku.toLowerCase() === String(value).toLowerCase() || item.name.toLowerCase() === String(value).toLowerCase()
            );
            if (p) {
              updated.raw_material_sku = p.sku;
              updated.name = p.name;
              updated.uom = p.uom || updated.uom || "KG";
            } else {
              updated.name = value;
              if (!updated.raw_material_sku) updated.raw_material_sku = `RM-CUSTOM-${Date.now().toString().slice(-4)}`;
            }
          }
          return updated;
        }
        return ing;
      })
    );
  };

  const generateSku = (name: string, variant: string) => {
    if (!name.trim()) return "";
    const cleanName = name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().substring(0, 4);
    const cleanVar = variant && variant !== "Standard" ? `-${variant.substring(0, 3).toUpperCase()}` : "";
    return `FG-${cleanName}${cleanVar}`;
  };

  const handleSaveProductFormula = async (formData: ProductFormData) => {
    const primaryFormula = formData.size_formulas[formData.active_size] || Object.values(formData.size_formulas)[0];
    const primaryPrice = primaryFormula?.retail_price || 0;
    const primaryUom = formData.active_size;

    let updatedRecipes: BoMRecipe[] = [...recipes];
    let primaryRecipe: BoMRecipe | null = null;

    Object.entries(formData.size_formulas).forEach(([sizeKey, sizeForm]) => {
      const recId = `bom-${formData.code}-${sizeKey.replace(/[\s()]/g, "_")}`;
      const recObj: BoMRecipe = {
        id: recId,
        finished_product_sku: formData.code,
        finished_product_name: `${formData.final_product_name} (${sizeKey})`,
        batch_yield_qty: 1,
        batch_yield_uom: sizeKey,
        version: "v1.0",
        ingredients: sizeForm.ingredients.map((ing) => ({
          raw_material_sku: ing.raw_material_sku || `RM-${ing.name.substring(0, 3).toUpperCase()}`,
          name: ing.name,
          ratio_qty: ing.ratio_qty,
          uom: ing.uom,
        })),
        retail_price: sizeForm.retail_price,
      };

      if (sizeKey === formData.active_size) {
        primaryRecipe = recObj;
      }

      updatedRecipes = updatedRecipes.filter(
        (r) => r.id !== recId && r.finished_product_name !== recObj.finished_product_name
      );
      updatedRecipes.unshift(recObj);
    });

    setRecipes(updatedRecipes);
    if (primaryRecipe) {
      setSelectedRecipe(primaryRecipe);
      setTargetBatchQty(100);
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_RECIPES_KEY, JSON.stringify(updatedRecipes));
    } catch (err) {}

    // Update products catalog
    try {
      const storedProds = localStorage.getItem("jrc_product_catalog_cache_v1");
      let parsedProds = storedProds ? JSON.parse(storedProds) : [];
      const newProd = {
        id: `p-${Date.now()}`,
        sku: formData.code,
        name: formData.final_product_name,
        variant_scent: formData.product_type,
        category: "finished_chemical",
        uom: primaryUom,
        min_reorder_level: 10,
        current_stock: 0,
        unit_cost: 0,
        selling_price: primaryPrice,
        supplier_name: "JRC In-House Production",
        supplier_price: 0,
        size_formulas: formData.size_formulas,
      };
      parsedProds = parsedProds.filter((p: any) => p.sku !== formData.code);
      parsedProds.unshift(newProd);
      localStorage.setItem("jrc_product_catalog_cache_v1", JSON.stringify(parsedProds));
    } catch (err) {}

    setIsModalOpen(false);
    setEditingRecipeId(null);
    setEditingFormData(null);

    try {
      const supabase = createClient();
      await supabase.from("products").upsert({
        sku: formData.code,
        name: formData.final_product_name,
        category: "finished_chemical",
        uom: primaryUom,
        unit_cost: 0,
        selling_price: primaryPrice,
      }, { onConflict: "sku" });
    } catch (err) {}
  };

  const handleDeleteRecipe = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this chemical formula recipe?")) return;
    const updated = recipes.filter((r) => r.id !== id);
    setRecipes(updated);
    if (selectedRecipe?.id === id) {
      setSelectedRecipe(updated[0] || null);
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_RECIPES_KEY, JSON.stringify(updated));
    } catch (err) {}
  };

  const handleEditRecipe = (r: BoMRecipe, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRecipeId(r.id);
    const parts = r.finished_product_name.split(" - ");
    const cleanBaseName = parts.length >= 2 ? parts[1].replace(/\s*\([^)]*\)/, "") : r.finished_product_name.replace(/\s*\([^)]*\)/, "");
    const cleanType = parts.length >= 3 ? parts[2].replace(/\s*\([^)]*\)/, "") : "Wood Preservative";
    const sizeKey = r.batch_yield_uom || "1 DRUM";

    setEditingFormData({
      id: r.id,
      code: r.finished_product_sku,
      product_name: cleanBaseName,
      product_type: cleanType,
      product_class: "Finished Product",
      final_product_name: r.finished_product_name,
      active_size: sizeKey,
      size_formulas: {
        [sizeKey]: {
          production_size: sizeKey,
          retail_price: r.retail_price || 0,
          ingredients: r.ingredients || [],
        },
      },
    });
    setIsModalOpen(true);
  };

  const scalingMultiplier = selectedRecipe ? targetBatchQty / (selectedRecipe.batch_yield_qty || 1) : 1;

  return (
    <RoleGuard allowedRoles={["super_admin", "production_manager", "production_lead"]} moduleName="Production & Chemical BoM">
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* STICKY TOP NAVIGATION BAR */}
      <TopNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
              <FlaskConical className="w-7 h-7 text-blue-700" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Production Department (Manufacturing Tasks)</h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Log finished chemical products with embedded formulas, scale batch yields, and process work orders</p>
            </div>
          </div>

          <button
            onClick={() => {
              loadData();
              setEditingRecipeId(null);
              setEditingFormData(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-500 text-slate-950 font-extrabold text-sm shadow-md shadow-yellow-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
            <span>+ Log Product & Formula</span>
          </button>
        </div>

        {/* TASK-ORIENTED SYNCHRONIZED ORDER WORKSPACE FOR PRODUCTION */}
        <OrderTaskView activeDepartment="Production" employeeName="Production Lead" />

        {/* CHEMICAL FORMULA MASTER & BATCH SCALER */}
        {recipes.length > 0 && (
          <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm space-y-4 pt-4 border-t-4 border-t-blue-600">
            <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-blue-700" />
              <span>Chemical BoM Formulas & Batch Scaler</span>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* RECIPE LIST */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-blue-700 uppercase tracking-wider">Product Formulas ({recipes.length})</h4>
                {recipes.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedRecipe(r);
                      setTargetBatchQty(r.batch_yield_qty * 2);
                    }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer relative group ${
                      selectedRecipe?.id === r.id
                        ? "bg-blue-50 border-blue-600 shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-extrabold text-blue-700">{r.finished_product_sku}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-200 text-slate-800">{r.version}</span>
                        <button
                          onClick={(e) => handleEditRecipe(r, e)}
                          className="p-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                          title="Edit Formula"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteRecipe(r.id, e)}
                          className="p-1 rounded bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors"
                          title="Delete Formula"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 mt-1">{r.finished_product_name}</h4>
                    <p className="text-xs text-slate-600 font-medium mt-1">Standard Batch: {r.batch_yield_qty} {r.batch_yield_uom} ({r.ingredients.length} ingredients)</p>
                  </div>
                ))}
              </div>

              {/* SCALED INGREDIENTS DETAILED DISPLAY */}
              <div className="lg:col-span-2 bg-slate-50 p-5 rounded-2xl border-2 border-slate-200 space-y-4">
                {selectedRecipe ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-200 pb-3">
                      <div>
                        <span className="font-mono text-xs font-extrabold text-blue-700">{selectedRecipe.finished_product_sku}</span>
                        <h3 className="text-base font-extrabold text-slate-900">{selectedRecipe.finished_product_name}</h3>
                        <p className="text-xs text-slate-500 font-medium">Standard Formula Base: {selectedRecipe.batch_yield_qty} {selectedRecipe.batch_yield_uom}</p>
                      </div>

                      <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border-2 border-slate-200 shadow-xs">
                        <Scale className="w-4 h-4 text-amber-500 shrink-0" />
                        <label className="text-xs font-extrabold text-slate-700 whitespace-nowrap">Scale Batch:</label>
                        <input
                          type="number"
                          value={targetBatchQty}
                          onChange={(e) => setTargetBatchQty(Number(e.target.value))}
                          className="w-24 p-1.5 bg-slate-50 border-2 border-slate-300 rounded-lg text-xs font-mono font-extrabold text-slate-900 text-right focus:border-blue-600"
                        />
                        <span className="text-xs font-mono font-bold text-slate-700">{selectedRecipe.batch_yield_uom}</span>
                      </div>
                    </div>

                    {/* INGREDIENT RATIOS TABLE */}
                    <div className="space-y-2">
                      <span className="text-xs font-extrabold text-amber-600 uppercase tracking-wider block">
                        Scaled Chemical Consumption ({scalingMultiplier.toFixed(2)}x Multiplier)
                      </span>

                      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider font-extrabold">
                              <th className="py-2.5 px-3">Raw Material SKU</th>
                              <th className="py-2.5 px-3">Ingredient Name</th>
                              <th className="py-2.5 px-3">Standard Ratio</th>
                              <th className="py-2.5 px-3 text-right">Scaled Required Qty</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                            {selectedRecipe.ingredients.map((ing, idx) => {
                              const scaledQty = ing.ratio_qty * scalingMultiplier;
                              return (
                                <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                  <td className="py-2.5 px-3 font-mono text-xs text-blue-700">{ing.raw_material_sku}</td>
                                  <td className="py-2.5 px-3 text-slate-900 font-extrabold">{ing.name}</td>
                                  <td className="py-2.5 px-3 text-slate-600 font-mono">{ing.ratio_qty} {ing.uom}</td>
                                  <td className="py-2.5 px-3 text-right font-mono font-extrabold text-amber-600 text-sm">
                                    {scaledQty.toFixed(2)} {ing.uom}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-slate-400 font-medium">Select a formula to view scaled ingredients.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LOG FINISHED PRODUCT & FORMULA MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white border-2 border-blue-600 rounded-2xl w-full max-w-4xl p-4 sm:p-6 space-y-4 shadow-2xl my-auto">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 border border-blue-200">
                    <FlaskConical className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                      {editingRecipeId ? "Edit Finished Product Formula" : "Log Finished Product & Formula"}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Configure product code, name, type, and size-specific chemical formulas (Drum, Pail, Liter)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingRecipeId(null);
                    setEditingFormData(null);
                  }}
                  className="text-slate-400 hover:text-slate-900 text-lg font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <ProductFormulaEditor
                initialData={editingFormData || undefined}
                availableRawMaterials={rawMaterialsList}
                onSave={handleSaveProductFormula}
                onCancel={() => {
                  setIsModalOpen(false);
                  setEditingRecipeId(null);
                  setEditingFormData(null);
                }}
              />
            </div>
          </div>
        )}
      </main>
      </div>
    </RoleGuard>
  );
}
