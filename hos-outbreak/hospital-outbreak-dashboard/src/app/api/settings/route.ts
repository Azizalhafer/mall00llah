import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { settingsTable } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NewSetting } from '@/lib/db';

// GET /api/settings - Get all settings or a specific setting by key
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    const db = getDb(request.env.DB);
    
    if (key) {
      // Get a specific setting by key
      const setting = await db.select().from(settingsTable).where(eq(settingsTable.key, key));
      
      if (setting.length === 0) {
        return NextResponse.json({ error: 'لم يتم العثور على الإعداد المطلوب' }, { status: 404 });
      }
      
      return NextResponse.json({ setting: setting[0] }, { status: 200 });
    } else {
      // Get all settings
      const settings = await db.select().from(settingsTable);
      return NextResponse.json({ settings }, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الإعدادات' },
      { status: 500 }
    );
  }
}

// POST /api/settings - Create or update a setting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.key || !body.value) {
      return NextResponse.json(
        { error: 'الحقول المطلوبة مفقودة: المفتاح والقيمة مطلوبان' },
        { status: 400 }
      );
    }
    
    const db = getDb(request.env.DB);
    
    // Check if setting already exists
    const existingSetting = await db.select().from(settingsTable).where(eq(settingsTable.key, body.key));
    
    if (existingSetting.length > 0) {
      // Update existing setting
      const result = await db.update(settingsTable)
        .set({ 
          value: body.value,
          description: body.description || existingSetting[0].description,
          updatedAt: new Date()
        })
        .where(eq(settingsTable.key, body.key))
        .returning();
      
      return NextResponse.json({ setting: result[0], updated: true }, { status: 200 });
    } else {
      // Create new setting
      const newSetting: NewSetting = {
        key: body.key,
        value: body.value,
        description: body.description || null,
      };
      
      const result = await db.insert(settingsTable).values(newSetting).returning();
      
      return NextResponse.json({ setting: result[0], created: true }, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating/updating setting:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء أو تحديث الإعداد' },
      { status: 500 }
    );
  }
}

// DELETE /api/settings - Delete a setting by key
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json(
        { error: 'مفتاح الإعداد مطلوب للحذف' },
        { status: 400 }
      );
    }
    
    const db = getDb(request.env.DB);
    
    // Check if setting exists
    const existingSetting = await db.select().from(settingsTable).where(eq(settingsTable.key, key));
    
    if (existingSetting.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على الإعداد المطلوب للحذف' }, { status: 404 });
    }
    
    await db.delete(settingsTable).where(eq(settingsTable.key, key));
    
    return NextResponse.json({ message: 'تم حذف الإعداد بنجاح' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting setting:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الإعداد' },
      { status: 500 }
    );
  }
}
