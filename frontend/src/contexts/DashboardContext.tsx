import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { UserWidget } from '../types/dashboard';

interface DashboardContextType {
  widgets: UserWidget[];
  setWidgets: (widgets: UserWidget[]) => void;
  addWidget: (widget: UserWidget) => void;
  removeWidget: (widgetId: number) => void;
  updateWidgetPosition: (widgetId: number, position: number) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [widgets, setWidgets] = useState<UserWidget[]>([]);

  const addWidget = (widget: UserWidget) => {
    setWidgets((prev) => [...prev, widget]);
  };

  const removeWidget = (widgetId: number) => {
    setWidgets((prev) => prev.filter((w) => w.widget_id !== widgetId));
  };

  const updateWidgetPosition = (widgetId: number, position: number) => {
    setWidgets((prev) =>
      prev.map((w) => (w.widget_id === widgetId ? { ...w, position } : w))
    );
  };

  return (
    <DashboardContext.Provider
      value={{
        widgets,
        setWidgets,
        addWidget,
        removeWidget,
        updateWidgetPosition,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
