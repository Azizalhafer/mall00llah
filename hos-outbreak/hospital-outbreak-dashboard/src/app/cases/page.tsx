// src/app/cases/page.tsx
"use client"; 

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Case } from '@/lib/db'; // Import the Case type

const CasesPage = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [outbreakId, setOutbreakId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [labResultFilter, setLabResultFilter] = useState<string>('');
  const [outbreaks, setOutbreaks] = useState<{id: number, name: string}[]>([]);
  const [loadingOutbreaks, setLoadingOutbreaks] = useState<boolean>(true);

  // Fetch outbreaks for the dropdown
  const fetchOutbreaks = async () => {
    setLoadingOutbreaks(true);
    try {
      const response = await fetch('/api/outbreaks');
      if (!response.ok) {
        throw new Error('فشل في جلب بيانات الفاشيات');
      }
      const data = await response.json();
      setOutbreaks(data.outbreaks || []);
    } catch (err: any) {
      console.error('Error fetching outbreaks:', err);
      // Don't set error state here to avoid blocking the main cases view
    } finally {
      setLoadingOutbreaks(false);
    }
  };

  // Fetch cases based on selected outbreak
  const fetchCases = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!outbreakId) {
        setCases([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/outbreaks/${outbreakId}/cases`);
      if (!response.ok) {
        throw new Error('فشل في جلب بيانات الحالات');
      }
      const data = await response.json();
      setCases(data.cases || []);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutbreaks();
  }, []); // Fetch outbreaks on initial load

  useEffect(() => {
    if (outbreakId) {
      fetchCases();
    }
  }, [outbreakId]); // Fetch cases when outbreak selection changes

  const handleFilter = () => {
    fetchCases(); // Re-fetch based on current outbreakId
  };

  // Client-side filtering based on search term and lab result
  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = 
      (caseItem.patientName && caseItem.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (caseItem.patientMrn && caseItem.patientMrn.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLabResult = !labResultFilter || 
      (caseItem.labResult && caseItem.labResult.toLowerCase() === labResultFilter.toLowerCase());
    
    return matchesSearch && matchesLabResult;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">إدارة الحالات (Line List)</h2>
        <Link href="/cases/new">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
            + إضافة حالة جديدة
          </button>
        </Link>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <select 
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={outbreakId}
            onChange={(e) => setOutbreakId(e.target.value)}
            disabled={loadingOutbreaks}
          >
            <option value="">اختر الفاشية:</option>
            {outbreaks.map(outbreak => (
              <option key={outbreak.id} value={outbreak.id}>{outbreak.name}</option>
            ))}
          </select>
          <input 
            type="text" 
            placeholder="بحث باسم المريض أو رقم الملف..."
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={labResultFilter}
            onChange={(e) => setLabResultFilter(e.target.value)}
          >
            <option value="">كل النتائج المخبرية</option>
            <option value="إيجابي">إيجابي</option>
            <option value="سلبي">سلبي</option>
            <option value="قيد الانتظار">قيد الانتظار</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button 
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            onClick={handleFilter}
            disabled={loading || !outbreakId}
          >
            {loading ? 'جاري التحميل...' : 'تطبيق الفلتر'}
          </button>
        </div>
      </div>

      {/* Prompt to select an outbreak */}
      {!outbreakId && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md mb-6">
          <p className="text-center">يرجى اختيار فاشية من القائمة المنسدلة لعرض الحالات المرتبطة بها.</p>
        </div>
      )}

      {/* Loading and Error States */}
      {loading && <p className="text-center text-gray-500">جاري تحميل الحالات...</p>}
      {error && <p className="text-center text-red-500">خطأ: {error}</p>}

      {/* Cases Table */}
      {!loading && !error && outbreakId && (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم المريض</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الملف</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ ظهور الأعراض</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نتيجة المختبر</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النتيجة</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCases.length > 0 ? (
                filteredCases.map((caseItem) => (
                  <tr key={caseItem.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{caseItem.patientName || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{caseItem.patientMrn || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caseItem.symptomOnsetDate ? new Date(caseItem.symptomOnsetDate).toLocaleDateString('ar-SA') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        caseItem.labResult === 'إيجابي' ? 'bg-red-100 text-red-800' : 
                        caseItem.labResult === 'سلبي' ? 'bg-green-100 text-green-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                        {caseItem.labResult || 'غير متوفر'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caseItem.outcome === 'recovered' ? 'تعافى' : 
                       caseItem.outcome === 'deceased' ? 'متوفى' : 
                       caseItem.outcome === 'transferred' ? 'تم نقله' : 'قيد العلاج'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/cases/${caseItem.id}`}>
                        <span className="text-blue-600 hover:text-blue-900 cursor-pointer ml-4">تفاصيل</span>
                      </Link>
                      <Link href={`/cases/${caseItem.id}/edit`}>
                        <span className="text-green-600 hover:text-green-900 cursor-pointer">تعديل</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    {outbreakId ? 'لا توجد حالات تطابق البحث أو الفلتر.' : 'يرجى اختيار فاشية لعرض الحالات.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CasesPage;
