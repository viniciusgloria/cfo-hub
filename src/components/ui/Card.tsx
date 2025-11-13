import { ReactNode, MouseEventHandler } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div onClick={onClick} className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors text-gray-800 dark:text-gray-100 ${className}`}>
      {children}
    </div>
  );
}
