import React, { useState } from 'react';

export function Tabs({ defaultValue, className = '', children }) {
  const [value, setValue] = useState(defaultValue);
  return <div className={className}>{React.Children.map(children, child => React.cloneElement(child, { activeValue: value, setValue }))}</div>;
}
export function TabsList({ className = '', children }) {
  return <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}>{children}</div>;
}
export function TabsTrigger({ value: v, children, activeValue, setValue }) {
  const active = activeValue === v;
  const classes = `inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${active ? 'bg-background text-foreground shadow' : 'hover:text-foreground'}`;
  return <button className={classes} onClick={() => setValue(v)}>{children}</button>;
}
export function TabsContent({ value: v, activeValue, children }) {
  if (activeValue !== v) return null;
  return <div className="mt-2">{children}</div>;
}
