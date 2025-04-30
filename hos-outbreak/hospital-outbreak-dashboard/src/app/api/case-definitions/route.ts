import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { caseDefinitionsTable, outbreaksTable } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { NewCaseDefinition } from '@/lib/db';

// GET /api/case-definitions - Get all case definitions (optionally filtered by outbreak_id)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outbreakIdStr = searchParams.get('outbreakId');
    const db = getDb(request.env.DB);

    let query = db.select().from(caseDefinitionsTable);

    if (outbreakIdStr) {
      const outbreakId = parseInt(outbreakIdStr, 10);
      if (isNaN(outbreakId)) {
        return NextResponse.json({ error: 'معرف الفاشية غير صالح' }, { status: 400 });
      }
      // Verify outbreak exists
      const outbreakExists = await db.select({ id: outbreaksTable.id })
                                     .from(outbreaksTable)
                                     .where(eq(outbreaksTable.id, outbreakId));
      if (outbreakExists.length === 0) {
          return NextResponse.json({ error: 'لم يتم العثور على الفاشية المحددة.' }, { status: 404 });
      }
      query = query.where(eq(caseDefinitionsTable.outbreakId, outbreakId));
    }

    const definitions = await query.orderBy(caseDefinitionsTable.createdAt);

    return NextResponse.json({ caseDefinitions: definitions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching case definitions:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب تعريفات الحالات' },
      { status: 500 }
    );
  }
}

// POST /api/case-definitions - Create a new case definition
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.outbreakId || !body.name || !body.criteria) {
      return NextResponse.json(
        { error: 'الحقول المطلوبة مفقودة: معرف الفاشية، الاسم، والمعايير مطلوبة' },
        { status: 400 }
      );
    }

    const db = getDb(request.env.DB);

    // Verify outbreak exists
    const outbreakExists = await db.select({ id: outbreaksTable.id })
                                   .from(outbreaksTable)
                                   .where(eq(outbreaksTable.id, body.outbreakId));
    if (outbreakExists.length === 0) {
        return NextResponse.json({ error: 'لم يتم العثور على الفاشية المحددة لربط التعريف بها.' }, { status: 404 });
    }

    const newDefinition: NewCaseDefinition = {
      outbreakId: body.outbreakId,
      name: body.name,
      criteria: body.criteria,
    };

    const result = await db.insert(caseDefinitionsTable).values(newDefinition).returning();

    return NextResponse.json({ caseDefinition: result[0] }, { status: 201 });

  } catch (error) {
    console.error('Error creating case definition:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء تعريف حالة جديد.' },
      { status: 500 }
    );
  }
}

// Note: PUT /api/case-definitions/[id] and DELETE /api/case-definitions/[id] can be added if needed.

