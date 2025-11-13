import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

export function FilterBox({ children, className = '' }: Props) {
  // Removed border and focus ring to match new design: keep background, padding and rounded corners
  return (
    <div className={`flex items-center gap-2 p-2 rounded-md ${className}`}>
      {children}
    </div>
  );
}

export default FilterBox;
