import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdminSidebarContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const AdminSidebarContext = createContext<AdminSidebarContextType | undefined>(undefined);

interface AdminSidebarProviderProps {
  children: ReactNode;
}

export const AdminSidebarProvider: React.FC<AdminSidebarProviderProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const value = {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
  };

  return (
    <AdminSidebarContext.Provider value={value}>
      {children}
    </AdminSidebarContext.Provider>
  );
};

// Custom hook to use the admin sidebar context
export const useAdminSidebar = () => {
  const context = useContext(AdminSidebarContext);
  if (context === undefined) {
    throw new Error('useAdminSidebar must be used within an AdminSidebarProvider');
  }
  return context;
};
