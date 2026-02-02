import { Dropdown } from "./Dropdown";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  icon?: React.ReactNode;
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
  id,
  icon,
}: SelectProps) {
  return (
    <div className="w-full">
      <Dropdown
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
        icon={icon}
      />
      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          id={id}
          value={value}
          onChange={() => {}}
          required={required}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
