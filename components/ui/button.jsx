import React from 'react';

export function Button({ asChild, variant = 'default', size = 'md', className = '', ...props }) {
  const classes = [
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50',
    variant === 'outline' ? 'border bg-transparent hover:bg-accent' : 'bg-primary text-primary-foreground hover:bg-primary/90',
    size === 'sm' ? 'h-8 px-3 py-1' : size === 'lg' ? 'h-11 px-8' : 'h-10 px-4 py-2',
    className
  ].join(' ');
  return <button className={classes} {...props} />;
}
