import { ReactNode } from 'react';
import { Card } from './Card';

interface PageHeaderProps {
  title: string;
  children?: ReactNode; // right-side controls (filters, buttons)
  className?: string;
}

export function PageHeader({ title, children, className = '' }: PageHeaderProps) {
  return (
    <Card className={`p-4 flex items-center justify-between ${className}`}>
      <div>
        {/* Typography matches the provided examples: size + weight + light/dark color */}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </Card>
  );
}
