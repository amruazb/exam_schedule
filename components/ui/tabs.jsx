import React, { createContext, useContext, useState } from 'react';

// Create a context to share the active tab value and setter
const TabsContext = createContext(null);

export function Tabs({ defaultValue, className = '', children }) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className = '', children }) {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const active = activeTab === value;
  
  const classes = `inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${active ? 'bg-background text-foreground shadow' : 'hover:text-foreground'}`;
  
  return (
    <button 
      className={classes} 
      onClick={() => setActiveTab(value)}
      type="button"
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }) {
  const { activeTab } = useContext(TabsContext);
  
  if (activeTab !== value) return null;
  
  return <div className="mt-2">{children}</div>;
}
