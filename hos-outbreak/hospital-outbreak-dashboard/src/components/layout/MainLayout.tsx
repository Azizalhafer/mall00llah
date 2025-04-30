import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Fixed on the right for RTL */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden mr-64"> {/* Add margin-right to account for fixed sidebar width */}
        {/* Header - Fixed at the top */}
        <Header />

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 pt-20"> {/* Add padding-top for fixed header height */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

