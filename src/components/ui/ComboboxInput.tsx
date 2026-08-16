"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface ComboboxOption {
  value: string;
  label?: string;
  sublabel?: string;
}

interface ComboboxInputProps {
  value: string;
  onChange: (val: string) => void;
  options: (string | ComboboxOption)[];
  placeholder?: string;
  className?: string;
  required?: boolean;
  id?: string;
  disabled?: boolean;
}

export function ComboboxInput({
  value,
  onChange,
  options,
  placeholder = "Type or select from list...",
  className = "",
  required = false,
  id,
  disabled = false,
}: ComboboxInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const datalistId = id ? `datalist-${id}` : `datalist-${generatedId.replace(/:/g, "")}`;

  // Close dropdown menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleArrowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Try native showPicker first
    if (inputRef.current && "showPicker" in inputRef.current) {
      try {
        inputRef.current.focus();
        (inputRef.current as any).showPicker();
      } catch (err) {}
    }

    // Toggle custom overlay menu
    setIsOpen((prev) => !prev);
    inputRef.current?.focus();
  };

  const formattedOptions: ComboboxOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const filteredOptions = formattedOptions.filter((opt) => {
    if (!value.trim()) return true;
    const valLower = value.toLowerCase();
    return (
      opt.value.toLowerCase().includes(valLower) ||
      (opt.label && opt.label.toLowerCase().includes(valLower)) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(valLower))
    );
  });

  return (
    <div ref={containerRef} className="relative w-full inline-block">
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        disabled={disabled}
        required={required}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className={`w-full pr-9 ${className}`}
      />

      <button
        type="button"
        tabIndex={-1}
        onClick={handleArrowClick}
        disabled={disabled}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors flex items-center justify-center cursor-pointer z-10"
        title="Toggle Dropdown List"
      >
        <ChevronDown className={`w-4 h-4 text-slate-600 font-extrabold stroke-[2.5] transition-transform duration-200 ${isOpen ? "rotate-180 text-blue-700" : ""}`} />
      </button>

      {/* INTERACTIVE CUSTOM DROPDOWN OVERLAY */}
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-blue-600 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto p-1.5 space-y-0.5">
          {filteredOptions.map((opt, idx) => {
            const isSelected = value.toLowerCase() === opt.value.toLowerCase() || value.toLowerCase() === (opt.label || "").toLowerCase();
            return (
              <button
                key={idx}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                  isSelected
                    ? "bg-blue-600 text-white font-extrabold"
                    : "text-slate-800 hover:bg-blue-50 hover:text-blue-900"
                }`}
              >
                <div>
                  <span className="block font-bold">{opt.label || opt.value}</span>
                  {opt.sublabel && (
                    <span className={`text-[10px] block ${isSelected ? "text-blue-100" : "text-slate-500 font-normal"}`}>
                      {opt.sublabel}
                    </span>
                  )}
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-white" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
