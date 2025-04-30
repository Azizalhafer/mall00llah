import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { controlActionsTable, outbreaksTable } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NewControlAction } from '@/lib/db';

// GET /api/outbreaks/[id]/actions - Get all control actions for a specific outbreak
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

    // Verify outbreak exists
    const outbreakExists = await db.select({ id: outbreaksTable.id })
                                   .from(outbreaksTable)
                                   .where(eq(outbreaksTable.id, outbreakId));
    if (outbreakExists.length === 0) {
        return NextResponse.json({ error: 'لم يتم العثور على الفاشية المحددة.' }, { status: 404 });
    }

    const actions = await db.select()
      .from(controlActionsTable)
      .where(eq(controlActionsTable.outbreakId, outbreakId))
      .orderBy(controlActionsTable.createdAt);

    return NextResponse.json({ controlActions: actions }, { status: 200 });
  } catch (error) {
    console.error(`Error fetching control actions for outbreak ${params.id}:`, error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب إجراءات السيطرة' },
      { status: 500 }
    );
  }
}

// POST /api/outbreaks/[id]/actions - Create a new control action for a specific outbreak
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const outbreakId = parseInt(params.id, 10);
    if (isNaN(outbreakId)) {
      return NextResponse.json({ error: 'معرف الفاشية غير صالح' }, { status: 400 });
    }

    const body = await request.json();

    // Validation
    if (!body.actionType || !body.description || !body.status) {
      return NextResponse.json(
        { error: 'الحقول المطلوبة مفقودة: نوع الإجراء، الوصف، والحالة مطلوبة' },
        { status: 400 }
      );
    }

    const db = getDb(request.env.DB);

    // Verify outbreak exists
    const outbreakExists = await db.select({ id: outbreaksTable.id })
                                   .from(outbreaksTable)
                                   .where(eq(outbreaksTable.id, outbreakId));
    if (outbreakExists.length === 0) {
        return NextResponse.json({ error: 'لم يتم العثور على الفاشية المحددة لربط الإجراء بها.' }, { status: 404 });
    }

    const newAction: NewControlAction = {
      outbreakId: outbreakId,
      actionType: body.actionType,
      description: body.description,
      startDate: body.startDate ? new Date(body.startDate).getTime() : null,
      completionDate: body.completionDate ? new Date(body.completionDate).getTime() : null,
      responsiblePerson: body.responsiblePerson || null,
      status: body.status,
      effectivenessNotes: body.effectivenessNotes || null,
    };

    const result = await db.insert(controlActionsTable).values(newAction).returning();

    return NextResponse.json({ controlAction: result[0] }, { status: 201 });

  } catch (error) {
    console.error(`Error creating control action for outbreak ${params.id}:`, error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء إجراء سيطرة جديد.' },
      { status: 500 }
    );
  }
}

// Note: PUT /api/actions/[id] and DELETE /api/actions/[id] can be added if needed for managing individual actions.

