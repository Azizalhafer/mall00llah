import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { outbreaksTable } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// GET /api/outbreaks/[id] - Get a specific outbreak by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'معرف الفاشية غير صالح' }, { status: 400 });
    }

    const db = getDb(request.env.DB);
    const result = await db.select().from(outbreaksTable).where(eq(outbreaksTable.id, id));

    if (result.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على الفاشية' }, { status: 404 });
    }

    return NextResponse.json({ outbreak: result[0] }, { status: 200 });
  } catch (error) {
    console.error(`Error fetching outbreak ${params.id}:`, error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات الفاشية' },
      { status: 500 }
    );
  }
}

// PUT /api/outbreaks/[id] - Update an existing outbreak
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'معرف الفاشية غير صالح' }, { status: 400 });
    }

    const body = await request.json();
    const db = getDb(request.env.DB);

    // Check if outbreak exists
    const existing = await db.select({ id: outbreaksTable.id }).from(outbreaksTable).where(eq(outbreaksTable.id, id));
    if (existing.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على الفاشية للتحديث' }, { status: 404 });
    }

    const updatedFields: Partial<typeof outbreaksTable.$inferInsert> = {};
    if (body.name) updatedFields.name = body.name;
    if (body.description) updatedFields.description = body.description;
    if (body.pathogen) updatedFields.pathogen = body.pathogen;
    if (body.startDate) updatedFields.startDate = new Date(body.startDate).getTime();
    if (body.endDate !== undefined) updatedFields.endDate = body.endDate ? new Date(body.endDate).getTime() : null;
    if (body.status) updatedFields.status = body.status;
    updatedFields.updatedAt = new Date(); // Update the timestamp

    if (Object.keys(updatedFields).length === 1 && 'updatedAt' in updatedFields) {
        return NextResponse.json({ error: 'لا توجد حقول لتحديثها' }, { status: 400 });
    }

    const result = await db.update(outbreaksTable)
      .set(updatedFields)
      .where(eq(outbreaksTable.id, id))
      .returning();

    return NextResponse.json({ outbreak: result[0] }, { status: 200 });
  } catch (error) {
    console.error(`Error updating outbreak ${params.id}:`, error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث بيانات الفاشية' },
      { status: 500 }
    );
  }
}

// DELETE /api/outbreaks/[id] - Delete an outbreak
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'معرف الفاشية غير صالح' }, { status: 400 });
    }

    const db = getDb(request.env.DB);

    // Check if outbreak exists before deleting
    const existing = await db.select({ id: outbreaksTable.id }).from(outbreaksTable).where(eq(outbreaksTable.id, id));
    if (existing.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على الفاشية للحذف' }, { status: 404 });
    }

    await db.delete(outbreaksTable).where(eq(outbreaksTable.id, id));

    return NextResponse.json({ message: 'تم حذف الفاشية بنجاح' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting outbreak ${params.id}:`, error);
    // Check for foreign key constraint errors if applicable (e.g., if cases depend on it and ON DELETE is RESTRICT)
    // D1 uses ON DELETE CASCADE by default if specified in schema, so this might not be needed unless schema changes
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الفاشية. قد تكون هناك حالات مرتبطة بها.' },
      { status: 500 }
    );
  }
}

