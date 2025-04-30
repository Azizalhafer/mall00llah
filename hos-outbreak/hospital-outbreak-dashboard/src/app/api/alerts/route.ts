import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { alertsTable } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NewAlert } from '@/lib/db';

// GET /api/alerts - Get all alerts (optionally filtered by status)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const outbreakIdStr = searchParams.get('outbreakId');
    
    const db = getDb(request.env.DB);
    
    let query = db.select().from(alertsTable);
    
    // Filter by status if provided
    if (status) {
      query = query.where(eq(alertsTable.status, status));
    }
    
    // Filter by outbreak if provided
    if (outbreakIdStr) {
      const outbreakId = parseInt(outbreakIdStr, 10);
      if (!isNaN(outbreakId)) {
        query = query.where(eq(alertsTable.relatedOutbreakId, outbreakId));
      }
    }
    
    // Order by most recent first
    query = query.orderBy(alertsTable.createdAt).desc();
    
    const alerts = await query;
    
    return NextResponse.json({ alerts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب التنبيهات' },
      { status: 500 }
    );
  }
}

// POST /api/alerts - Create a new alert
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.alertType || !body.message || !body.status) {
      return NextResponse.json(
        { error: 'الحقول المطلوبة مفقودة: نوع التنبيه، الرسالة، والحالة مطلوبة' },
        { status: 400 }
      );
    }
    
    const db = getDb(request.env.DB);
    
    const newAlert: NewAlert = {
      alertType: body.alertType,
      message: body.message,
      relatedOutbreakId: body.relatedOutbreakId || null,
      relatedCaseId: body.relatedCaseId || null,
      status: body.status,
      acknowledgedAt: body.acknowledgedAt ? new Date(body.acknowledgedAt).getTime() : null,
      resolvedAt: body.resolvedAt ? new Date(body.resolvedAt).getTime() : null,
    };
    
    const result = await db.insert(alertsTable).values(newAlert).returning();
    
    return NextResponse.json({ alert: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء تنبيه جديد' },
      { status: 500 }
    );
  }
}

// PUT /api/alerts/[id] - Update alert status (e.g., acknowledge or resolve)
// This could be implemented if needed
