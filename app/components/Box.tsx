import React from 'react';

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

/**
 * A flexible container component.
 */
export function Box({className = '', children, ...rest}: BoxProps) {
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  );
}
