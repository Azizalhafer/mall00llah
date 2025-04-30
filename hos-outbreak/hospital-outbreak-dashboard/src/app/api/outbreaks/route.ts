import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { outbreaksTable } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// GET /api/outbreaks - Get all outbreaks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const db = getDb(request.env.DB);
    
    let query = db.select().from(outbreaksTable);
    
    // Filter by status if provided
    if (status) {
      query = query.where(eq(outbreaksTable.status, status));
    }
    
    // Order by most recent first
    query = query.orderBy(outbreaksTable.createdAt).desc();
    
    const outbreaks = await query;
    
    return NextResponse.json({ outbreaks }, { status: 200 });
  } catch (error) {
    console.error('Error fetching outbreaks:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات الفاشيات' },
      { status: 500 }
    );
  }
}

// POST /api/outbreaks - Create a new outbreak
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.status) {
      return NextResponse.json(
        { error: 'الحقول المطلوبة مفقودة: الاسم والحالة مطلوبان' },
        { status: 400 }
      );
    }
    
    const db = getDb(request.env.DB);
    
    const newOutbreak = {
      name: body.name,
      description: body.description || null,
      pathogen: body.pathogen || null,
      startDate: body.startDate ? new Date(body.startDate).getTime() : null,
      endDate: body.endDate ? new Date(body.endDate).getTime() : null,
      status: body.status,
    };
    
    const result = await db.insert(outbreaksTable).values(newOutbreak).returning();
    
    return NextResponse.json({ outbreak: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating outbreak:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء فاشية جديدة' },
      { status: 500 }
    );
  }
}
