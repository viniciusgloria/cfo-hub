import React from 'react';

type Option = { value: string; label: string };

type FilterPillProps = {
  icon?: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  className?: string;
  'aria-label'?: string;
};

export function FilterPill({ icon, value, onChange, options, className = '', ['aria-label']: ariaLabel }: FilterPillProps) {
  return (
    <div className={`flex items-center gap-2 bg-gray-50 p-2 rounded-md ${className}`.trim()}>
      {icon}
      <select value={value} onChange={onChange} className="bg-transparent text-sm outline-none" aria-label={ariaLabel}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FilterPill;
