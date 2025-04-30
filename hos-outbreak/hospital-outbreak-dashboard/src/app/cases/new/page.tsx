// src/app/cases/new/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter for redirection
import { Outbreak, Location, CaseDefinition } from '@/lib/db'; // Import types

const NewCasePage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    outbreakId: '',
    caseDefinitionId: '',
    patientName: '',
    patientMrn: '',
    dateOfBirth: '',
    gender: '',
    admissionDate: '',
    symptomOnsetDate: '',
    diagnosisDate: '',
    locationId: '',
    labResult: '',
    labResultDate: '',
    outcome: 'ongoing',
    notes: '',
    reportedToSeha: false,
  });
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [caseDefinitions, setCaseDefinitions] = useState<CaseDefinition[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch data for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Outbreaks
        const outbreaksRes = await fetch("/api/outbreaks");
        if (!outbreaksRes.ok) throw new Error("فشل في جلب الفاشيات");
        const outbreaksData = await outbreaksRes.json();
        setOutbreaks(outbreaksData.outbreaks || []);

        // Fetch Locations (Assuming an API endpoint exists)
        // Replace with actual endpoint if available
        // const locationsRes = await fetch("/api/locations");
        // if (!locationsRes.ok) throw new Error("فشل في جلب المواقع");
        // const locationsData = await locationsRes.json();
        // setLocations(locationsData.locations || []);
        // Placeholder locations for now:
        setLocations([
          { id: 1, name: "قسم العناية المركزة أ", type: "Ward", description: null, createdAt: new Date() },
          { id: 2, name: "قسم الأطفال", type: "Ward", description: null, createdAt: new Date() },
          { id: 3, name: "الجناح الجراحي", type: "Ward", description: null, createdAt: new Date() },
          { id: 4, name: "قسم الطوارئ", type: "Department", description: null, createdAt: new Date() },
        ]);

        // Fetch Case Definitions (Assuming an API endpoint exists)
        const definitionsRes = await fetch("/api/case-definitions");
        if (!definitionsRes.ok) throw new Error("فشل في جلب تعريفات الحالات");
        const definitionsData = await definitionsRes.json();
        setCaseDefinitions(definitionsData.caseDefinitions || []);

      } catch (err: any) {
        setError(err.message || "حدث خطأ أثناء تحميل بيانات النموذج");
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validation (can be enhanced)
    if (!formData.outbreakId || !formData.patientName || !formData.patientMrn || !formData.symptomOnsetDate || !formData.locationId) {
        setError("يرجى ملء جميع الحقول المطلوبة (*).");
        setLoading(false);
        return;
    }

    try {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          // Convert IDs to numbers if they are strings from the form
          outbreakId: parseInt(formData.outbreakId, 10),
          caseDefinitionId: formData.caseDefinitionId ? parseInt(formData.caseDefinitionId, 10) : null,
          locationId: parseInt(formData.locationId, 10),
          // Ensure dates are sent in a format the backend expects (e.g., ISO string or timestamp)
          // The backend currently expects timestamps (milliseconds)
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).getTime() : null,
          admissionDate: formData.admissionDate ? new Date(formData.admissionDate).getTime() : null,
          symptomOnsetDate: new Date(formData.symptomOnsetDate).getTime(),
          diagnosisDate: formData.diagnosisDate ? new Date(formData.diagnosisDate).getTime() : null,
          labResultDate: formData.labResultDate ? new Date(formData.labResultDate).getTime() : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "فشل في إنشاء الحالة");
      }

      setSuccess("تم إنشاء الحالة بنجاح!");
      // Optionally reset form or redirect
      // setFormData({ ...initial state... }); // Reset form
      setTimeout(() => router.push("/cases"), 1500); // Redirect after 1.5 seconds

    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع أثناء إنشاء الحالة.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">إضافة حالة جديدة</h2>
        <Link href="/cases">
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
            العودة إلى قائمة الحالات
          </button>
        </Link>
      </div>

      {/* Case Entry Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">المعلومات الأساسية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الفاشية المرتبطة *</label>
                <select 
                  name="outbreakId"
                  value={formData.outbreakId}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">اختر الفاشية</option>
                  {outbreaks.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تعريف الحالة</label>
                <select 
                  name="caseDefinitionId"
                  value={formData.caseDefinitionId}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر تعريف الحالة</option>
                  {caseDefinitions
                    .filter(cd => !formData.outbreakId || cd.outbreakId === parseInt(formData.outbreakId, 10)) // Filter by selected outbreak
                    .map(cd => (
                      <option key={cd.id} value={cd.id}>{cd.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المريض *</label>
                <input 
                  type="text" 
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الملف الطبي (MRN) *</label>
                <input 
                  type="text" 
                  name="patientMrn"
                  value={formData.patientMrn}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الميلاد</label>
                <input 
                  type="date" 
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الجنس</label>
                <select 
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر الجنس</option>
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
            </div>
          </div>

          {/* Epidemiological Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">المعلومات الوبائية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الدخول للمستشفى</label>
                <input 
                  type="date" 
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ ظهور الأعراض *</label>
                <input 
                  type="date" 
                  name="symptomOnsetDate"
                  value={formData.symptomOnsetDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ التشخيص</label>
                <input 
                  type="date" 
                  name="diagnosisDate"
                  value={formData.diagnosisDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الموقع *</label>
                <select 
                  name="locationId"
                  value={formData.locationId}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">اختر الموقع</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Laboratory Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">المعلومات المخبرية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نتيجة المختبر</label>
                <select 
                  name="labResult"
                  value={formData.labResult}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر النتيجة</option>
                  <option value="إيجابي">إيجابي</option>
                  <option value="سلبي">سلبي</option>
                  <option value="قيد الانتظار">قيد الانتظار</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ نتيجة المختبر</label>
                <input 
                  type="date" 
                  name="labResultDate"
                  value={formData.labResultDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Outcome Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">النتيجة النهائية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">النتيجة</label>
                <select 
                  name="outcome"
                  value={formData.outcome}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ongoing">قيد العلاج</option>
                  <option value="recovered">تعافى</option>
                  <option value="deceased">متوفى</option>
                  <option value="transferred">تم نقله</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Seha Reporting Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">التبليغ لمنصة صحة</h3>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="reportToSeha" 
                name="reportedToSeha"
                checked={formData.reportedToSeha}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="reportToSeha" className="mr-2 block text-sm text-gray-700">
                تبليغ الحالة إلى منصة صحة
              </label>
            </div>
          </div>

          {/* Loading, Error, Success Messages */}
          {loading && <p className="text-center text-blue-500 mb-4">جاري حفظ الحالة...</p>}
          {error && <p className="text-center text-red-500 mb-4">خطأ: {error}</p>}
          {success && <p className="text-center text-green-500 mb-4">{success}</p>}

          {/* Form Buttons */}
          <div className="flex justify-end space-x-4 space-x-reverse">
            <Link href="/cases">
              <button type="button" className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300" disabled={loading}>
                إلغاء
              </button>
            </Link>
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "جاري الحفظ..." : "حفظ الحالة"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCasePage;
