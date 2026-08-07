"use client";

import React, { useId } from "react";
import { ChevronDown } from "lucide-react";

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
  const generatedId = useId();
  const datalistId = id ? `datalist-${id}` : `datalist-${generatedId.replace(/:/g, "")}`;

  return (
    <div className="relative w-full inline-block">
      <input
        id={id}
        type="text"
        list={datalistId}
        value={value}
        disabled={disabled}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pr-8 ${className}`}
      />
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
        <ChevronDown className="w-4 h-4 text-slate-500 font-extrabold stroke-[2.5]" />
      </div>
      <datalist id={datalistId}>
        {options.map((opt, idx) => {
          if (typeof opt === "string") {
            return <option key={idx} value={opt} />;
          }
          const text = opt.label || opt.value;
          const sub = opt.sublabel ? ` (${opt.sublabel})` : "";
          return <option key={opt.value || idx} value={opt.value}>{`${text}${sub}`}</option>;
        })}
      </datalist>
    </div>
  );
}
