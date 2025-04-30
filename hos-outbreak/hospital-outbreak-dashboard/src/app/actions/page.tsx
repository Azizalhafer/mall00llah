// src/app/actions/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Outbreak, Action } from '@/lib/db'; // Import types

const ActionsPage = () => {
  const [actions, setActions] = useState<Action[]>([]);
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOutbreakId, setSelectedOutbreakId] = useState<string>('');
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

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

  // Fetch actions based on selected outbreak and filters
  const fetchActions = async () => {
    if (!selectedOutbreakId) {
      setActions([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Construct the API URL with query parameters
      let url = `/api/outbreaks/${selectedOutbreakId}/actions`;
      const params = new URLSearchParams();
      if (actionTypeFilter) {
        params.append('type', actionTypeFilter);
      }
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('فشل في جلب بيانات الإجراءات');
      }
      const data = await response.json();
      setActions(data.actions || []);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  // Fetch actions when outbreak or filters change
  useEffect(() => {
    fetchActions();
  }, [selectedOutbreakId, actionTypeFilter, statusFilter]);

  const handleFilter = () => {
    fetchActions(); // Re-fetch based on current selections
  };

  // Function to get outbreak name by ID
  const getOutbreakName = (id: number | null) => {
    if (!id) return 'غير محدد';
    const outbreak = outbreaks.find(o => o.id === id);
    return outbreak ? outbreak.name : 'فاشية غير معروفة';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">إدارة إجراءات السيطرة</h2>
        {/* Button to add new action - Needs implementation */}
        {/* <Link href="/actions/new"> 
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
            + إضافة إجراء جديد
          </button>
        </Link> */}
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select 
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedOutbreakId}
            onChange={(e) => setSelectedOutbreakId(e.target.value)}
          >
            <option value="">اختر الفاشية:</option>
            {outbreaks.map(outbreak => (
              <option key={outbreak.id} value={outbreak.id}>{outbreak.name}</option>
            ))}
          </select>
          <select 
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={actionTypeFilter}
            onChange={(e) => setActionTypeFilter(e.target.value)}
          >
            <option value="">كل أنواع الإجراءات</option>
            <option value="Isolation">عزل</option>
            <option value="Cleaning">تنظيف</option>
            <option value="Hand Hygiene Campaign">حملة نظافة اليدين</option>
            <option value="Contact Precautions">احتياطات التلامس</option>
            <option value="Screening">فحص</option>
            <option value="Education">تثقيف</option>
            <option value="Other">أخرى</option>
          </select>
          <select 
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">كل الحالات</option>
            <option value="planned">مخطط له</option>
            <option value="in_progress">قيد التنفيذ</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغى</option>
          </select>
        </div>
        <div className="mt-4 flex justify-end">
          <button 
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            onClick={handleFilter}
            disabled={loading || !selectedOutbreakId}
          >
            {loading ? 'جاري التحميل...' : 'تطبيق الفلتر'}
          </button>
        </div>
      </div>

      {/* Prompt to select an outbreak */}
      {!selectedOutbreakId && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md mb-6">
          <p className="text-center">يرجى اختيار فاشية من القائمة المنسدلة لعرض الإجراءات المرتبطة بها.</p>
        </div>
      )}

      {/* Loading and Error States */}
      {loading && <p className="text-center text-gray-500">جاري تحميل الإجراءات...</p>}
      {error && <p className="text-center text-red-500">خطأ: {error}</p>}

      {/* Actions Table */}
      {!loading && !error && selectedOutbreakId && (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الفاشية</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نوع الإجراء</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوصف</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ البدء</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المسؤول</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {actions.length > 0 ? (
                actions.map((action) => (
                  <tr key={action.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getOutbreakName(action.outbreakId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{action.actionType || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={action.description || ''}>{action.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {action.startDate ? new Date(action.startDate).toLocaleDateString('ar-SA') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${action.status === 'completed' ? 'bg-green-100 text-green-800' : 
                         action.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                         action.status === 'planned' ? 'bg-yellow-100 text-yellow-800' : 
                         'bg-gray-100 text-gray-800'}`}>
                        {action.status === 'completed' ? 'مكتمل' : 
                         action.status === 'in_progress' ? 'قيد التنفيذ' : 
                         action.status === 'planned' ? 'مخطط له' : 'ملغى'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{action.responsiblePerson || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/actions/${action.id}/edit`}> {/* Adjust link as needed */}
                        <span className="text-blue-600 hover:text-blue-900 cursor-pointer">تعديل/تفاصيل</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    {selectedOutbreakId ? 'لا توجد إجراءات تطابق البحث أو الفلتر.' : 'يرجى اختيار فاشية لعرض الإجراءات.'}
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

export default ActionsPage;

