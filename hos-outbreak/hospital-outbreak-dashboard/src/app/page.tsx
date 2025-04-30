// src/app/page.tsx (Main Dashboard Page)
import React from 'react';

const DashboardPage = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">لوحة التحكم الرئيسية</h2>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Active Outbreaks */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">الفاشيات النشطة</h3>
          <p className="text-3xl font-bold text-blue-600">5</p> {/* Placeholder data */}
        </div>

        {/* Card 2: New Cases (Today) */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">الحالات الجديدة (اليوم)</h3>
          <p className="text-3xl font-bold text-red-600">12</p> {/* Placeholder data */}
        </div>

        {/* Card 3: Pending Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">الإجراءات المعلقة</h3>
          <p className="text-3xl font-bold text-yellow-600">3</p> {/* Placeholder data */}
        </div>

        {/* Card 4: Recent Alerts */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">التنبيهات الأخيرة</h3>
          <p className="text-3xl font-bold text-purple-600">8</p> {/* Placeholder data */}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Chart 1: Epi Curve Placeholder */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">منحنى الوباء (آخر 7 أيام)</h3>
          <div className="h-64 bg-gray-200 rounded flex items-center justify-center text-gray-500">
            {/* Placeholder for Epi Curve Chart */}
            سيتم عرض الرسم البياني هنا
          </div>
        </div>

        {/* Chart 2: Cases by Location Placeholder */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">توزيع الحالات حسب الموقع</h3>
          <div className="h-64 bg-gray-200 rounded flex items-center justify-center text-gray-500">
            {/* Placeholder for Location Chart (e.g., Bar chart or Map) */}
            سيتم عرض الرسم البياني هنا
          </div>
        </div>
      </div>

      {/* Recent Activity / Alerts Table Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">آخر الأنشطة والتنبيهات</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوقت</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النوع</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوصف</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Placeholder Row 1 */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">منذ 5 دقائق</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">تنبيه</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">تسجيل حالة مؤكدة جديدة (MRSA) في قسم العناية المركزة</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">جديد</td>
              </tr>
              {/* Placeholder Row 2 */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">منذ 30 دقيقة</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">إجراء</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">بدء إجراءات العزل للمريض في الغرفة 305</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">مكتمل</td>
              </tr>
              {/* Add more placeholder rows as needed */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

