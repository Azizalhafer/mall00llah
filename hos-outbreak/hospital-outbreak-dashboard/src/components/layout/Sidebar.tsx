import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import Image component

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white h-screen p-4 fixed top-0 right-0 overflow-y-auto">
      {/* Logo Section */}
      <div className="mb-8 flex justify-center">
        <Link href="/">
          <Image 
            src="/images/hafr-albatin-logo.png" 
            alt="شعار تجمع حفر الباطن الصحي" 
            width={150} // Adjust width as needed
            height={75} // Adjust height based on aspect ratio
            priority // Load logo quickly
          />
        </Link>
      </div>

      {/* Navigation Links */}
      <nav>
        <ul>
          <li className="mb-4">
            <Link href="/" className="block p-2 rounded hover:bg-gray-700">
              لوحة التحكم الرئيسية
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/outbreaks" className="block p-2 rounded hover:bg-gray-700">
              إدارة الفاشيات
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/cases" className="block p-2 rounded hover:bg-gray-700">
              إدارة الحالات (Line List)
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/epi-curve" className="block p-2 rounded hover:bg-gray-700">
              منحنى الوباء (Epi Curve)
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/actions" className="block p-2 rounded hover:bg-gray-700">
              إدارة الإجراءات
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/reports" className="block p-2 rounded hover:bg-gray-700">
              التقارير
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/settings" className="block p-2 rounded hover:bg-gray-700">
              الإعدادات
            </Link>
          </li>
          {/* Add other links as needed, e.g., Login/Logout, User Profile */}
          <li className="mb-4">
            <Link href="/login" className="block p-2 rounded hover:bg-gray-700">
              تسجيل الدخول
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

