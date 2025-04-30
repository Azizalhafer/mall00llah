// src/app/epi-curve/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Case } from '@/lib/db';

// Simple bar chart component since we couldn't install recharts
const SimpleBarChart = ({ data, maxValue }: { data: {date: string, count: number}[], maxValue: number }) => {
  return (
    <div className="h-64 flex items-end space-x-1 space-x-reverse mt-4">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center">
          <div 
            className="bg-blue-500 w-12 rounded-t-sm" 
            style={{ 
              height: `${(item.count / maxValue) * 100}%`,
              minHeight: item.count > 0 ? '8px' : '0'
            }}
          ></div>
          <div className="text-xs mt-1 transform -rotate-45 origin-top-right">{item.date}</div>
          <div className="text-xs font-bold">{item.count}</div>
        </div>
      ))}
    </div>
  );
};

const EpiCurvePage = () => {
  const [outbreaks, setOutbreaks] = useState<{id: number, name: string}[]>([]);
  const [selectedOutbreakId, setSelectedOutbreakId] = useState<string>('');
  const [periodType, setPeriodType] = useState<string>('daily');
  const [caseType, setCaseType] = useState<string>('all');
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
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

  // Fetch cases when outbreak selection changes
  useEffect(() => {
    const fetchCases = async () => {
      if (!selectedOutbreakId) {
        setCases([]);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/outbreaks/${selectedOutbreakId}/cases`);
        if (!response.ok) throw new Error('فشل في جلب بيانات الحالات');
        const data = await response.json();
        setCases(data.cases || []);
      } catch (err: any) {
        setError(err.message || 'حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCases();
  }, [selectedOutbreakId]);

  // Process cases data for the chart
  const processChartData = () => {
    if (!cases.length) return { chartData: [], maxCount: 0, totalCases: 0, avgDaily: 0, peakInfo: { count: 0, date: '' } };
    
    // Filter cases based on selected type
    const filteredCases = caseType === 'all' 
      ? cases 
      : cases.filter(c => {
          if (caseType === 'confirmed') return c.labResult === 'إيجابي';
          if (caseType === 'suspected') return c.labResult !== 'إيجابي';
          return true;
        });
    
    // Group cases by date
    const dateGroups: Record<string, number> = {};
    
    filteredCases.forEach(c => {
      if (!c.symptomOnsetDate) return;
      
      let dateKey;
      const date = new Date(c.symptomOnsetDate);
      
      if (periodType === 'daily') {
        dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (periodType === 'weekly') {
        // Get the week number (simplified)
        const weekNum = Math.ceil((date.getDate() + (new Date(date.getFullYear(), date.getMonth(), 1).getDay())) / 7);
        dateKey = `${date.getFullYear()}-W${weekNum}`;
      } else { // monthly
        dateKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      }
      
      dateGroups[dateKey] = (dateGroups[dateKey] || 0) + 1;
    });
    
    // Convert to array and sort by date
    const chartData = Object.entries(dateGroups)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // Calculate statistics
    const totalCases = filteredCases.length;
    const avgDaily = totalCases / (chartData.length || 1);
    const maxCount = Math.max(...chartData.map(d => d.count), 0);
    const peakDay = chartData.reduce((max, curr) => curr.count > max.count ? curr : max, { date: '', count: 0 });
    
    return { 
      chartData, 
      maxCount, 
      totalCases, 
      avgDaily: parseFloat(avgDaily.toFixed(1)), 
      peakInfo: peakDay 
    };
  };

  const { chartData, maxCount, totalCases, avgDaily, peakInfo } = processChartData();

  const handleUpdateChart = () => {
    // The chart will update automatically due to the useEffect dependencies
    // This function is just for the button click handler
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">منحنى الوباء (Epi Curve)</h2>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اختر الفاشية:</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedOutbreakId}
              onChange={(e) => setSelectedOutbreakId(e.target.value)}
            >
              <option value="">اختر الفاشية</option>
              {outbreaks.map(outbreak => (
                <option key={outbreak.id} value={outbreak.id}>{outbreak.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الفترة الزمنية:</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value)}
            >
              <option value="daily">يومي</option>
              <option value="weekly">أسبوعي</option>
              <option value="monthly">شهري</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نوع الحالات:</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={caseType}
              onChange={(e) => setCaseType(e.target.value)}
            >
              <option value="all">جميع الحالات</option>
              <option value="confirmed">الحالات المؤكدة فقط</option>
              <option value="suspected">الحالات المشتبهة فقط</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={handleUpdateChart}
            disabled={loading}
          >
            {loading ? 'جاري التحميل...' : 'تحديث الرسم البياني'}
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">توزيع الحالات حسب تاريخ ظهور الأعراض</h3>
        
        {!selectedOutbreakId && (
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">يرجى اختيار فاشية لعرض منحنى الوباء</p>
          </div>
        )}
        
        {loading && (
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">جاري تحميل البيانات...</p>
          </div>
        )}
        
        {error && (
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-red-500">خطأ: {error}</p>
          </div>
        )}
        
        {selectedOutbreakId && !loading && !error && (
          chartData.length > 0 ? (
            <div className="h-96 bg-gray-100 rounded-lg p-4 flex justify-center">
              <SimpleBarChart data={chartData} maxValue={maxCount} />
            </div>
          ) : (
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">لا توجد بيانات كافية لعرض المنحنى</p>
            </div>
          )
        )}

        {/* Legend */}
        <div className="mt-4 flex justify-center">
          <div className="flex items-center mr-6">
            <div className="w-4 h-4 bg-blue-500 rounded-sm mr-2"></div>
            <span className="text-sm text-gray-600">
              {caseType === 'confirmed' ? 'حالات مؤكدة' : 
               caseType === 'suspected' ? 'حالات مشتبهة' : 'جميع الحالات'}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      {selectedOutbreakId && !loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h4 className="text-md font-semibold text-gray-700 mb-2">إجمالي الحالات</h4>
            <p className="text-2xl font-bold text-blue-600">{totalCases}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h4 className="text-md font-semibold text-gray-700 mb-2">متوسط الحالات اليومي</h4>
            <p className="text-2xl font-bold text-blue-600">{avgDaily}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h4 className="text-md font-semibold text-gray-700 mb-2">ذروة الإصابات</h4>
            <p className="text-2xl font-bold text-blue-600">
              {peakInfo.count > 0 ? `${peakInfo.count} (${peakInfo.date})` : 'لا توجد بيانات'}
            </p>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="mt-6 flex justify-end">
        <button 
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 mr-4 disabled:opacity-50"
          disabled={!selectedOutbreakId || loading || !!error || chartData.length === 0}
        >
          تصدير كصورة (PNG)
        </button>
        <button 
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50"
          disabled={!selectedOutbreakId || loading || !!error || chartData.length === 0}
        >
          تصدير البيانات (Excel)
        </button>
      </div>
    </div>
  );
};

export default EpiCurvePage;
