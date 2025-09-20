import React from 'react';

export function Badge({ variant = 'default', className = '', ...props }) {
  const classes = [
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
    variant === 'outline' ? 'text-foreground' : 'bg-secondary text-secondary-foreground',
    className
  ].join(' ');
  return <div className={classes} {...props} />;
}
