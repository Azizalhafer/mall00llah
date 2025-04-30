// src/app/outbreaks/page.tsx
"use client"; 

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Outbreak } from '@/lib/db'; // Import the Outbreak type

const OutbreaksPage = () => {
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchOutbreaks = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/outbreaks';
      const params = new URLSearchParams();
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      // Note: Backend doesn't support search term yet, filtering done client-side for now
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('فشل في جلب بيانات الفاشيات');
      }
      const data = await response.json();
      setOutbreaks(data.outbreaks || []);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutbreaks();
  }, []); // Fetch on initial load

  const handleFilter = () => {
    fetchOutbreaks(); // Re-fetch based on current statusFilter
  };

  // Client-side filtering based on search term
  const filteredOutbreaks = outbreaks.filter(outbreak => 
    outbreak.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (outbreak.pathogen && outbreak.pathogen.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">إدارة الفاشيات</h2>
        <Link href="/outbreaks/new"> 
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
            + إضافة فاشية جديدة
          </button>
        </Link>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input 
            type="text" 
            placeholder="بحث بالاسم أو المسبب..."
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">كل الحالات</option>
            <option value="active">نشطة</option>
            <option value="monitoring">تحت المراقبة</option>
            <option value="closed">مغلقة</option>
          </select>
          <button 
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            onClick={handleFilter}
            disabled={loading}
          >
            {loading ? 'جاري التحميل...' : 'تطبيق الفلتر'}
          </button>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && <p className="text-center text-gray-500">جاري تحميل الفاشيات...</p>}
      {error && <p className="text-center text-red-500">خطأ: {error}</p>}

      {/* Outbreaks Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المسبب</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ البدء</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                {/* <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عدد الحالات</th> */} {/* Count needs separate query/join */} 
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOutbreaks.length > 0 ? (
                filteredOutbreaks.map((outbreak) => (
                  <tr key={outbreak.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{outbreak.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{outbreak.pathogen || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {outbreak.startDate ? new Date(outbreak.startDate).toLocaleDateString('ar-SA') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${outbreak.status === 'active' ? 'bg-red-100 text-red-800' : outbreak.status === 'monitoring' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {outbreak.status === 'active' ? 'نشطة' : outbreak.status === 'monitoring' ? 'تحت المراقبة' : 'مغلقة'}
                      </span>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{outbreak.caseCount}</td> */} {/* Placeholder */} 
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/outbreaks/${outbreak.id}`}> 
                        <span className="text-blue-600 hover:text-blue-900 cursor-pointer">تفاصيل</span>
                      </Link>
                      {/* Add Edit/Delete buttons later if needed */}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">لا توجد فاشيات تطابق البحث أو الفلتر.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OutbreaksPage;

