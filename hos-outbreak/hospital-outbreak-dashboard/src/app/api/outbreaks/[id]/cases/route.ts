import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { casesTable, outbreaksTable } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/outbreaks/[id]/cases - Get all cases for a specific outbreak
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const outbreakId = parseInt(params.id, 10);
    if (isNaN(outbreakId)) {
      return NextResponse.json({ error: 'معرف الفاشية غير صالح' }, { status: 400 });
    }

    const db = getDb(request.env.DB);

    // Optional: Check if outbreak exists first
    const outbreakExists = await db.select({ id: outbreaksTable.id }).from(outbreaksTable).where(eq(outbreaksTable.id, outbreakId));
    if (outbreakExists.length === 0) {
        return NextResponse.json({ error: 'لم يتم العثور على الفاشية المحددة' }, { status: 404 });
    }

    const cases = await db.select()
      .from(casesTable)
      .where(eq(casesTable.outbreakId, outbreakId))
      .orderBy(casesTable.symptomOnsetDate); // Order by symptom onset date

    return NextResponse.json({ cases }, { status: 200 });
  } catch (error) {
    console.error(`Error fetching cases for outbreak ${params.id}:`, error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب حالات الفاشية' },
      { status: 500 }
    );
  }
}

// POST /api/outbreaks/[id]/cases - Create a new case for a specific outbreak
// Note: This assumes you'll create individual cases via a dedicated /api/cases endpoint usually.
// Creating cases directly under an outbreak might be less common but possible.
// We will implement the main POST /api/cases route next.
// This endpoint is kept simple for now.
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
    // Placeholder: The primary way to add cases will be via POST /api/cases
    // This endpoint could be used if needed, but we'll focus on the main cases endpoint.
    return NextResponse.json({ message: 'لإضافة حالة جديدة، يرجى استخدام نقطة النهاية POST /api/cases وتضمين معرف الفاشية في البيانات.' }, { status: 405 }); // Method Not Allowed for now
}

