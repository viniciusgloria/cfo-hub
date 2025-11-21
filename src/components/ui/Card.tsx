import { ReactNode, MouseEventHandler, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  style?: CSSProperties;
}

export function Card({ children, className = '', onClick, style }: CardProps) {
  return (
    <div onClick={onClick} style={style} className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors ${className}`}>
      {children}
    </div>
  );
}
