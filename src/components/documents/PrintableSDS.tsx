"use client";

import React, { useState } from "react";
import { Printer, Edit3, CheckCircle2, ShieldAlert, Sparkles, X, Beaker, FileText, Lock, Sliders } from "lucide-react";

export interface SDSCompositionItem {
  ingredient_name: string;
  cas_number: string;
  percentage: string;
  hazard_codes: string;
}

export interface PrintableSDSProps {
  productName: string;
  productSku: string;
  category?: string;
  ingredients?: SDSCompositionItem[];
  onClose?: () => void;
}

export default function PrintableSDS({
  productName: initialProductName,
  productSku: initialProductSku,
  category: initialCategory = "Industrial Chemical Cleaner",
  ingredients: initialIngredients = [],
  onClose,
}: PrintableSDSProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Editable SDS Fields
  const [productName, setProductName] = useState(initialProductName);
  const [productSku, setProductSku] = useState(initialProductSku);
  const [category, setCategory] = useState(initialCategory);
  const [revisionDate, setRevisionDate] = useState(new Date().toISOString().split("T")[0]);
  const [signalWord, setSignalWord] = useState<"DANGER" | "WARNING" | "NONE">("DANGER");
  
  // GHS Pictograms selection
  const [selectedPictograms, setSelectedPictograms] = useState<{ [key: string]: boolean }>({
    corrosive: true,
    irritant: true,
    flammable: false,
    toxic: false,
  });

  const [composition, setComposition] = useState<SDSCompositionItem[]>(
    initialIngredients.length > 0
      ? initialIngredients
      : [
          { ingredient_name: "Sodium Metasilicate", cas_number: "6834-92-0", percentage: "10 - 15 %", hazard_codes: "H314, H335" },
          { ingredient_name: "Ethoxylated Alcohol Surfactant", cas_number: "68439-46-3", percentage: "5 - 8 %", hazard_codes: "H318, H302" },
          { ingredient_name: "Deionized Water & Inert Carriers", cas_number: "7732-18-5", percentage: "Balance", hazard_codes: "Non-hazardous" },
        ]
  );

  // Physical & Chemical Properties
  const [appearance, setAppearance] = useState("Clear Amber Liquid, Mild Characteristic Odor");
  const [phValue, setPhValue] = useState("11.5 - 12.5 (Alkaline)");
  const [specificGravity, setSpecificGravity] = useState("1.06 ± 0.02 g/cm³");
  const [flashPoint, setFlashPoint] = useState("Non-flammable (> 93°C)");
  
  // Handling & Emergency
  const [firstAidSkin, setFirstAidSkin] = useState("Flush skin immediately with plenty of water for at least 15 minutes. Remove contaminated clothing.");
  const [firstAidEyes, setFirstAidEyes] = useState("Rinse cautiously with water for several minutes. Remove contact lenses if present. Seek medical attention immediately.");
  const [firstAidInhalation, setFirstAidInhalation] = useState("Move person to fresh air. Keep comfortable for breathing. Administer oxygen if breathing is difficult.");
  const [handlingPpe, setHandlingPpe] = useState("Wear chemical-resistant nitrile gloves, splash goggles/face shield, and protective apron. Use in well-ventilated areas.");
  const [spillCleanup, setSpillCleanup] = useState("Contain spill with absorbent material (sand/earth). Neutralize mild residue and flush area with water in compliance with local DENR guidelines.");
  
  // Sign-off
  const [approverName, setApproverName] = useState("Engr. R. V. Depano");
  const [approverTitle, setApproverTitle] = useState("Technical Manager & Quality Assurance Lead");

  const handlePrint = () => {
    window.print();
  };

  const togglePictogram = (key: string) => {
    setSelectedPictograms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCompositionChange = (index: number, field: keyof SDSCompositionItem, value: string) => {
    setComposition((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleAddCompositionRow = () => {
    setComposition((prev) => [
      ...prev,
      { ingredient_name: "New Chemical Constituent", cas_number: "00-00-0", percentage: "1 - 5 %", hazard_codes: "H315" },
    ]);
  };

  const handleRemoveCompositionRow = (index: number) => {
    setComposition((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* TOP FLOATING ACTION BAR (HIDDEN IN PRINT) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border-2 border-slate-800 shadow-xl print:hidden text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600/30 border border-blue-400">
            <FileText className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold flex items-center gap-2">
              <span>Safety Data Sheet (GHS-SDS)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Marketing Verified</span>
            </h3>
            <p className="text-xs text-slate-300 font-medium">Formatted on official JRC Industrial Sales letterhead layout</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all border ${
              isEditing
                ? "bg-amber-400 text-slate-950 border-amber-500 shadow-md"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{isEditing ? "Done Editing (Preview)" : "Edit SDS Details"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 active:scale-95 transition-all border border-blue-400"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* EDIT DRAWER FOR MARKETING / TECHNICAL (HIDDEN IN PRINT) */}
      {isEditing && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 space-y-4 shadow-lg print:hidden text-slate-900 text-xs sm:text-sm">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <h4 className="font-extrabold text-amber-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-700" />
              <span>Customize SDS Fields for {productName}</span>
            </h4>
            <span className="text-[11px] font-bold text-amber-800">Changes update preview in real-time</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-extrabold block mb-1">Product Trade Name</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full p-2 bg-white border border-amber-300 rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="font-extrabold block mb-1">Product SKU / Code</label>
              <input
                type="text"
                value={productSku}
                onChange={(e) => setProductSku(e.target.value)}
                className="w-full p-2 bg-white border border-amber-300 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-extrabold block mb-1">Chemical Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 bg-white border border-amber-300 rounded-lg font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-extrabold block mb-1">GHS Signal Word</label>
              <select
                value={signalWord}
                onChange={(e) => setSignalWord(e.target.value as any)}
                className="w-full p-2 bg-white border border-amber-300 rounded-lg font-extrabold"
              >
                <option value="DANGER">DANGER (Severe Hazard)</option>
                <option value="WARNING">WARNING (Moderate Hazard)</option>
                <option value="NONE">NONE (Non-Hazardous)</option>
              </select>
            </div>

            <div>
              <label className="font-extrabold block mb-1">pH Range</label>
              <input
                type="text"
                value={phValue}
                onChange={(e) => setPhValue(e.target.value)}
                className="w-full p-2 bg-white border border-amber-300 rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="font-extrabold block mb-1">Specific Gravity / Density</label>
              <input
                type="text"
                value={specificGravity}
                onChange={(e) => setSpecificGravity(e.target.value)}
                className="w-full p-2 bg-white border border-amber-300 rounded-lg font-bold"
              />
            </div>
          </div>

          <div>
            <label className="font-extrabold block mb-1">Select Active GHS Hazard Symbols</label>
            <div className="flex flex-wrap gap-3 pt-1">
              {[
                { key: "corrosive", label: "🧪 Corrosive (Skin/Metals)" },
                { key: "irritant", label: "⚠️ Exclamation (Irritant)" },
                { key: "flammable", label: "🔥 Flammable" },
                { key: "toxic", label: "☠️ Health Hazard / Toxic" },
              ].map((pic) => (
                <label key={pic.key} className="flex items-center gap-1.5 font-bold cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-amber-200">
                  <input
                    type="checkbox"
                    checked={selectedPictograms[pic.key]}
                    onChange={() => togglePictogram(pic.key)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>{pic.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* EDIT COMPOSITION TABLE */}
          <div className="space-y-2 pt-2 border-t border-amber-200">
            <div className="flex items-center justify-between">
              <label className="font-extrabold block">Section 3: Formula Composition (% w/w)</label>
              <button
                type="button"
                onClick={handleAddCompositionRow}
                className="px-2.5 py-1 rounded bg-amber-200 hover:bg-amber-300 font-extrabold text-xs text-amber-950"
              >
                + Add Ingredient Row
              </button>
            </div>
            {composition.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  placeholder="Ingredient Name"
                  value={item.ingredient_name}
                  onChange={(e) => handleCompositionChange(idx, "ingredient_name", e.target.value)}
                  className="col-span-4 p-1.5 bg-white border border-amber-300 rounded text-xs font-bold"
                />
                <input
                  type="text"
                  placeholder="CAS #"
                  value={item.cas_number}
                  onChange={(e) => handleCompositionChange(idx, "cas_number", e.target.value)}
                  className="col-span-3 p-1.5 bg-white border border-amber-300 rounded text-xs font-mono font-bold"
                />
                <input
                  type="text"
                  placeholder="% w/w"
                  value={item.percentage}
                  onChange={(e) => handleCompositionChange(idx, "percentage", e.target.value)}
                  className="col-span-2 p-1.5 bg-white border border-amber-300 rounded text-xs font-bold"
                />
                <input
                  type="text"
                  placeholder="Hazard Codes"
                  value={item.hazard_codes}
                  onChange={(e) => handleCompositionChange(idx, "hazard_codes", e.target.value)}
                  className="col-span-2 p-1.5 bg-white border border-amber-300 rounded text-xs font-bold"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCompositionRow(idx)}
                  className="col-span-1 p-1 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded text-xs font-extrabold text-center"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="font-extrabold block mb-1">Technical Approver Name</label>
              <input
                type="text"
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                className="w-full p-2 bg-white border border-amber-300 rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="font-extrabold block mb-1">Approver Title</label>
              <input
                type="text"
                value={approverTitle}
                onChange={(e) => setApproverTitle(e.target.value)}
                className="w-full p-2 bg-white border border-amber-300 rounded-lg font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE SDS CONTAINER — EXACT JRC INDUSTRIAL SALES LETTERHEAD LAYOUT */}
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-4xl mx-auto font-sans relative overflow-hidden print:shadow-none print:rounded-none print:w-full print:max-w-none print:p-0">
        
        {/* ================================================================= */}
        {/* OFFICIAL LETTERHEAD TOP HEADER BANNER                             */}
        {/* ================================================================= */}
        <div className="relative pt-6 px-8 pb-4 border-b-2 border-slate-900 bg-white">
          {/* TOP RIGHT ANGLED BLUE & GOLD STRIPES WITH WEBSITE */}
          <div className="absolute top-0 right-0 flex items-center">
            {/* Blue Angled Polygon */}
            <div className="h-10 w-44 bg-[#054db0] transform -skew-x-12 origin-top-right"></div>
            {/* Gold Angled Polygon with Website */}
            <div className="h-10 bg-[#fbce19] pl-6 pr-8 flex items-center font-extrabold text-sm text-[#054db0] tracking-wide transform -skew-x-12 shadow-sm">
              <span className="transform skew-x-12">www.jrcjid.com</span>
            </div>
          </div>

          {/* TOP LEFT OFFICIAL JRC LOGO & COMPANY NAME */}
          <div className="flex items-center gap-3 pt-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#054db0] via-blue-600 to-[#fbce19] p-[2px] shadow-md">
              <div className="w-full h-full bg-[#060b17] rounded-[14px] flex items-center justify-center font-extrabold text-[#fbce19] text-xl tracking-wider">
                JRC
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-[#054db0] leading-none">JRC INDUSTRIAL SALES</h1>
              <p className="text-[11px] text-slate-600 font-bold uppercase tracking-wider mt-1">Household & Industrial Chemicals Manufacturing • Pest Control Services</p>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* INNER SDS DOCUMENT CONTENT AREA (FITS STRICTLY INSIDE FRAME)      */}
        {/* ================================================================= */}
        <div className="p-8 space-y-6 text-slate-900 text-xs leading-relaxed">
          
          {/* DOCUMENT HEADER TITLE */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
            <div>
              <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest block">GHS COMPLIANT SAFETY DATA SHEET</span>
              <h2 className="text-lg font-black text-slate-900 uppercase">{productName}</h2>
              <p className="text-[11px] font-semibold text-slate-600">Product Code: <strong className="font-mono text-slate-900">{productSku}</strong> | Category: <strong>{category}</strong></p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white font-extrabold text-[10px] rounded uppercase tracking-wider">
                DOCUMENT CODE: SDS-{productSku}
              </span>
              <p className="text-[10px] font-bold text-slate-500 mt-1">Revision Date: {revisionDate}</p>
            </div>
          </div>

          {/* SECTION 1: PRODUCT & COMPANY IDENTIFICATION */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-extrabold text-[#054db0] uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded border-l-4 border-[#054db0]">
              SECTION 1: PRODUCT & COMPANY IDENTIFICATION
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <p><strong>Product Name:</strong> {productName}</p>
                <p><strong>Recommended Use:</strong> Industrial/Commercial Cleaning, Sanitizing & Degreasing</p>
                <p><strong>Manufacturer:</strong> JRC Industrial Sales</p>
              </div>
              <div>
                <p><strong>Plant Address:</strong> 5 Luzon St. Brgy. Malanday, Marikina City 1805</p>
                <p><strong>Telephone Hotline:</strong> +63 8948 2516</p>
                <p><strong>Emergency Email:</strong> jrcjid@yahoo.com / jrcjid@gmail.com</p>
              </div>
            </div>
          </div>

          {/* SECTION 2: HAZARD IDENTIFICATION */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-extrabold text-[#054db0] uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded border-l-4 border-[#054db0]">
              SECTION 2: HAZARD(S) IDENTIFICATION
            </h3>
            <div className="flex flex-col sm:flex-row items-start gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 shrink-0">
                {selectedPictograms.corrosive && (
                  <div className="w-10 h-10 border-2 border-rose-600 transform rotate-45 flex items-center justify-center p-1 bg-white">
                    <span className="transform -rotate-45 font-extrabold text-rose-600 text-xs">🧪</span>
                  </div>
                )}
                {selectedPictograms.irritant && (
                  <div className="w-10 h-10 border-2 border-amber-500 transform rotate-45 flex items-center justify-center p-1 bg-white">
                    <span className="transform -rotate-45 font-extrabold text-amber-600 text-xs">⚠️</span>
                  </div>
                )}
                {selectedPictograms.flammable && (
                  <div className="w-10 h-10 border-2 border-rose-600 transform rotate-45 flex items-center justify-center p-1 bg-white">
                    <span className="transform -rotate-45 font-extrabold text-rose-600 text-xs">🔥</span>
                  </div>
                )}
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs">SIGNAL WORD:</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-black text-white ${signalWord === "DANGER" ? "bg-rose-600" : signalWord === "WARNING" ? "bg-amber-600" : "bg-slate-600"}`}>
                    {signalWord}
                  </span>
                </div>
                <p><strong>Hazard Statements:</strong> H314: Causes severe skin burns and eye damage. H335: May cause respiratory irritation.</p>
                <p><strong>Precautionary Statements:</strong> P280: Wear protective gloves/clothing/eye protection. P305+P351+P338: IF IN EYES: Rinse cautiously with water for several minutes.</p>
              </div>
            </div>
          </div>

          {/* SECTION 3: COMPOSITION / INGREDIENTS TABLE */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-extrabold text-[#054db0] uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded border-l-4 border-[#054db0]">
              SECTION 3: COMPOSITION / INFORMATION ON INGREDIENTS
            </h3>
            <table className="w-full border-collapse border border-slate-200 text-xs">
              <thead>
                <tr className="bg-slate-100 font-extrabold text-slate-800 border-b border-slate-300">
                  <th className="p-2 text-left">Chemical Ingredient Name</th>
                  <th className="p-2 text-left font-mono">CAS Number</th>
                  <th className="p-2 text-left">% Concentration (w/w)</th>
                  <th className="p-2 text-left">GHS Hazard Codes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {composition.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2 font-extrabold text-slate-900">{item.ingredient_name}</td>
                    <td className="p-2 font-mono text-slate-700">{item.cas_number}</td>
                    <td className="p-2 font-bold text-blue-700">{item.percentage}</td>
                    <td className="p-2 text-slate-600 font-medium">{item.hazard_codes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SECTION 4 & 8: FIRST AID & EXPOSURE CONTROL / PPE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-extrabold text-[#054db0] uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded border-l-4 border-[#054db0]">
                SECTION 4: FIRST-AID MEASURES
              </h3>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-[11px]">
                <p><strong>Skin Contact:</strong> {firstAidSkin}</p>
                <p><strong>Eye Contact:</strong> {firstAidEyes}</p>
                <p><strong>Inhalation:</strong> {firstAidInhalation}</p>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-extrabold text-[#054db0] uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded border-l-4 border-[#054db0]">
                SECTION 8: EXPOSURE & PPE
              </h3>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-[11px]">
                <p><strong>Respiratory:</strong> Use organic vapor respirator in confined spaces.</p>
                <p><strong>Eye/Face:</strong> Wear splash-proof chemical safety goggles or full face shield.</p>
                <p><strong>Hand Protection:</strong> Heavy-duty Nitrile or Neoprene gloves required.</p>
              </div>
            </div>
          </div>

          {/* SECTION 9 & 10: PHYSICAL PROPERTIES & REACTIVITY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-extrabold text-[#054db0] uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded border-l-4 border-[#054db0]">
                SECTION 9: PHYSICAL & CHEMICAL PROPERTIES
              </h3>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-[11px]">
                <p><strong>Appearance / Odor:</strong> {appearance}</p>
                <p><strong>pH Value:</strong> {phValue}</p>
                <p><strong>Specific Gravity:</strong> {specificGravity}</p>
                <p><strong>Flash Point:</strong> {flashPoint}</p>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-extrabold text-[#054db0] uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded border-l-4 border-[#054db0]">
                SECTION 10: STABILITY & REACTIVITY
              </h3>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-[11px]">
                <p><strong>Reactivity:</strong> Exothermic reaction when mixed with strong concentrated acids.</p>
                <p><strong>Incompatible Materials:</strong> Strong acids, oxidizing agents, soft metals (aluminum, zinc).</p>
                <p><strong>Decomposition:</strong> Emits Carbon Monoxide and Sodium Oxides under extreme thermal breakdown.</p>
              </div>
            </div>
          </div>

          {/* TECHNICAL APPROVAL & SIGN-OFF */}
          <div className="pt-4 border-t-2 border-slate-900 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Compliant with Philippine DENR R.A. 6969 & DOLE-OSH GHS Standards</p>
              <p className="text-xs font-black text-slate-900 mt-0.5">JRC INDUSTRIAL SALES — TECHNICAL QUALITY CONTROL</p>
            </div>

            <div className="text-right">
              <p className="text-xs font-black text-slate-900">{approverName}</p>
              <p className="text-[10px] text-slate-600 font-semibold">{approverTitle}</p>
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 mt-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Verified Technical Sign-off</span>
              </div>
            </div>
          </div>

        </div>

        {/* ================================================================= */}
        {/* OFFICIAL LETTERHEAD FOOTER (MATCHING EXACT USER DESIGN)           */}
        {/* ================================================================= */}
        <div className="mt-8 border-t-2 border-slate-200 pt-4 px-8 pb-6 bg-slate-50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* MAIL BLOCK */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#054db0] flex items-center justify-center text-white shrink-0 shadow-sm">
                ✉
              </div>
              <div>
                <span className="font-extrabold text-[#054db0] block text-[11px] uppercase tracking-wider">Mail :</span>
                <p className="text-[11px] font-bold text-slate-800 leading-tight">jrcjid@yahoo.com</p>
                <p className="text-[11px] font-bold text-slate-800 leading-tight">jrcjid@gmail.com</p>
              </div>
            </div>

            {/* PHONE BLOCK */}
            <div className="flex items-center gap-3 border-l sm:border-l-2 border-slate-300 pl-4">
              <div className="w-8 h-8 rounded-lg bg-[#054db0] flex items-center justify-center text-white shrink-0 shadow-sm">
                📞
              </div>
              <div>
                <span className="font-extrabold text-[#054db0] block text-[11px] uppercase tracking-wider">Phone :</span>
                <p className="text-[11px] font-bold text-slate-800 leading-tight">+63 8948 2516</p>
              </div>
            </div>

            {/* ADDRESS BLOCK */}
            <div className="flex items-center gap-3 border-l sm:border-l-2 border-slate-300 pl-4">
              <div className="w-8 h-8 rounded-lg bg-[#054db0] flex items-center justify-center text-white shrink-0 shadow-sm">
                📍
              </div>
              <div>
                <span className="font-extrabold text-[#054db0] block text-[11px] uppercase tracking-wider">Address :</span>
                <p className="text-[11px] font-bold text-slate-800 leading-tight">5 Luzon St. Brgy. Malanday,</p>
                <p className="text-[11px] font-bold text-slate-800 leading-tight">Marikina City 1805</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
