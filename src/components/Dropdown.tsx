import { useState, useRef, useEffect } from "react";
import { IconChevronDown } from "./icons";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  renderValue?: (option: DropdownOption | undefined) => React.ReactNode;
}

export function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  icon,
  renderValue,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption?.label || placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-2.5 ${
          icon ? "pl-10" : ""
        } border border-gray-200 rounded-xl text-sm transition-all ${
          disabled
            ? "bg-gray-100 cursor-not-allowed text-gray-500"
            : "bg-white hover:bg-gray-50 cursor-pointer"
        } ${isOpen ? "ring-2 ring-gray-200 border-gray-300" : ""}`}
      >
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {icon}
          </div>
        )}
        <span
          className={`flex-1 text-left ${
            !selectedOption ? "text-gray-400" : "text-gray-900"
          }`}
        >
          {renderValue ? renderValue(selectedOption) : displayText}
        </span>
        <IconChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors text-left ${
                  option.value === value ? "bg-gray-100 font-medium" : ""
                }`}
              >
                <span className="text-gray-900">{option.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
