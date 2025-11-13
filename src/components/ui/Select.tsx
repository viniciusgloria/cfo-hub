import { ReactNode } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export function Select({ children, className = '', ...rest }: SelectProps) {
  // Default styling ensures readable text/background in light and dark themes
  const base = `w-full px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 ${className}`;
  return (
    <select {...rest} className={base}>
      {children}
    </select>
  );
}

export default Select;
