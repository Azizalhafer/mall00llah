// src/app/reports/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Outbreak } from '@/lib/db'; // Import types

const ReportsPage = () => {
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([]);
  const [selectedOutbreakId, setSelectedOutbreakId] = useState<string>('');
  const [reportType, setReportType] = useState<string>('line_list');
  const [fileFormat, setFileFormat] = useState<string>('pdf');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch outbreaks for dropdown
  useEffect(() => {
    const fetchOutbreaks = async () => {
      try {
        const response = await fetch('/api/outbreaks');
        if (!response.ok) throw new Error('فشل في جلب بيانات الفاشيات');
        const data = await response.json();
        setOutbreaks(data.outbreaks || []);
      } catch (err: any) {
        console.error('Error fetching outbreaks:', err);
      }
    };
    fetchOutbreaks();
  }, []);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Construct the API URL with query parameters
      let url = `/api/reports`;
      const params = new URLSearchParams();
      params.append('type', reportType);
      params.append('format', fileFormat);
      if (selectedOutbreakId) {
        params.append('outbreakId', selectedOutbreakId);
      }
      url += `?${params.toString()}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('فشل في إنشاء التقرير');
      }

      // For a real implementation, we would handle the file download here
      // For now, just show a success message
      setSuccess('تم إنشاء التقرير بنجاح! سيبدأ التنزيل تلقائياً.');

      // Simulate file download (in a real app, we would use the blob from the response)
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = '#'; // In a real app, this would be a blob URL
        link.download = `report-${reportType}-${new Date().toISOString().split('T')[0]}.${fileFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 1000);

    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">التقارير</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">إنشاء تقرير جديد</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نوع التقرير:</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="line_list">قائمة الحالات (Line List)</option>
              <option value="epi_summary">ملخص وبائي</option>
              <option value="seha_report">تقرير منصة صحة</option>
              <option value="actions_report">تقرير الإجراءات</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الفاشية (اختياري):</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedOutbreakId}
              onChange={(e) => setSelectedOutbreakId(e.target.value)}
            >
              <option value="">كل الفاشيات</option>
              {outbreaks.map(outbreak => (
                <option key={outbreak.id} value={outbreak.id}>{outbreak.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تنسيق الملف:</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={fileFormat}
              onChange={(e) => setFileFormat(e.target.value)}
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel (XLSX)</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && <p className="text-center text-red-500 mb-4">خطأ: {error}</p>}
        {success && <p className="text-center text-green-500 mb-4">{success}</p>}

        <div className="flex justify-end">
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
            onClick={handleGenerateReport}
            disabled={loading}
          >
            {loading ? 'جاري إنشاء التقرير...' : 'إنشاء وتنزيل التقرير'}
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">التقارير المنشأة سابقاً</h3>
        
        {/* This would be populated from an API in a real implementation */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم التقرير</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نوع التقرير</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الإنشاء</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المستخدم</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Example row - would be populated from API */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">تقرير الحالات - فاشية MRSA</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">قائمة الحالات</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-04-27</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">مدير النظام</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 cursor-pointer">تنزيل</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">تقرير ملخص وبائي - فاشية Norovirus</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">ملخص وبائي</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-04-25</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">مدير النظام</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 cursor-pointer">تنزيل</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
