import React from 'react';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center fixed top-0 left-0 right-64 z-10">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-blue-600">نظام التقصي الوبائي</h1>
      </div>
      
      <div className="flex items-center space-x-4 space-x-reverse"> {/* space-x-reverse for RTL */}
        {/* Notifications */}
        <button className="p-2 rounded-full hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        
        {/* User Profile */}
        <div className="flex items-center">
          <span className="ml-2 text-gray-700">مدير النظام</span>
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
            م
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
