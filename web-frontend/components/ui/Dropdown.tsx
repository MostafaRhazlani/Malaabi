"use client";

import { useEffect, useRef, useState } from "react";
import { RiArrowDownSLine } from "@remixicon/react";

export interface DropdownOption<T extends string> {
  label: string;
  value: T;
}

interface DropdownProps<T extends string> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  fullWidth?: boolean;
  renderTrigger?: (selected: DropdownOption<T> | undefined) => React.ReactNode;
}

export default function Dropdown<T extends string>({
  options,
  value,
  onChange,
  placeholder = "Select…",
  fullWidth = false,
  renderTrigger,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${fullWidth ? "w-full" : ""}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${fullWidth ? "w-full" : ""}`}
        suppressHydrationWarning
      >
        {renderTrigger ? (
          renderTrigger(selected)
        ) : (
          <span className={`flex items-center ${fullWidth ? "justify-between w-full" : "gap-1.5"} bg-white/5 border border-white/10 text-slate-300 text-sm rounded-md px-3 py-2 hover:bg-white/10 transition-colors`}>
            {selected?.label ?? placeholder}
            <RiArrowDownSLine className="w-4 h-4 text-slate-400" />
          </span>
        )}
      </button>

      {open && (
        <ul className={`absolute z-50 mt-1 min-w-full w-max bg-slate-800 border border-white/10 rounded-lg shadow-xl overflow-hidden`}>
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => { onChange(option.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/10 ${
                  option.value === value ? "text-white font-medium" : "text-slate-300"
                }`}
                suppressHydrationWarning
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
