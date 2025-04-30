import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { casesTable, outbreaksTable, caseDefinitionsTable } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NewCase } from '@/lib/db'; // Import the type

// POST /api/cases - Create a new case
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // --- Validation --- 
    if (!body.outbreakId) {
      return NextResponse.json(
        { error: 'معرف الفاشية مطلوب لربط الحالة.' },
        { status: 400 }
      );
    }

    // Basic validation for required fields (adjust based on actual requirements)
    // For a real application, more robust validation (e.g., using Zod) is recommended.
    const requiredFields = ['outbreakId', 'symptomOnsetDate']; // Add other mandatory fields
    for (const field of requiredFields) {
        if (body[field] === undefined || body[field] === null || body[field] === '') {
            return NextResponse.json(
                { error: `الحقل المطلوب مفقود: ${field}` }, 
                { status: 400 }
            );
        }
    }

    const db = getDb(request.env.DB);

    // Verify outbreak exists
    const outbreakExists = await db.select({ id: outbreaksTable.id })
                                   .from(outbreaksTable)
                                   .where(eq(outbreaksTable.id, body.outbreakId));
    if (outbreakExists.length === 0) {
        return NextResponse.json({ error: 'لم يتم العثور على الفاشية المحددة.' }, { status: 404 });
    }

    // Verify case definition exists if provided
    if (body.caseDefinitionId) {
        const definitionExists = await db.select({ id: caseDefinitionsTable.id })
                                         .from(caseDefinitionsTable)
                                         .where(eq(caseDefinitionsTable.id, body.caseDefinitionId));
        if (definitionExists.length === 0) {
            return NextResponse.json({ error: 'لم يتم العثور على تعريف الحالة المحدد.' }, { status: 404 });
        }
    }
    // --- End Validation ---

    const newCase: NewCase = {
      outbreakId: body.outbreakId,
      caseDefinitionId: body.caseDefinitionId || null,
      patientMrn: body.patientMrn || null,
      patientName: body.patientName || null,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth).getTime() : null,
      gender: body.gender || null,
      admissionDate: body.admissionDate ? new Date(body.admissionDate).getTime() : null,
      symptomOnsetDate: new Date(body.symptomOnsetDate).getTime(), // Required
      diagnosisDate: body.diagnosisDate ? new Date(body.diagnosisDate).getTime() : null,
      labResult: body.labResult || null,
      labResultDate: body.labResultDate ? new Date(body.labResultDate).getTime() : null,
      locationId: body.locationId || null, // Add validation if location is mandatory
      outcome: body.outcome || null,
      notes: body.notes || null,
      reportedToSeha: body.reportedToSeha || false,
      sehaReportId: body.sehaReportId || null,
      // createdAt and updatedAt are handled by the database default
    };

    const result = await db.insert(casesTable).values(newCase).returning();

    return NextResponse.json({ case: result[0] }, { status: 201 });

  } catch (error) {
    console.error('Error creating case:', error);
    // More specific error handling could be added here (e.g., for database constraint violations)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء حالة جديدة.' },
      { status: 500 }
    );
  }
}

// Note: GET /api/cases (to get all cases across outbreaks) might be needed later.
// GET /api/cases/[id], PUT /api/cases/[id], DELETE /api/cases/[id] can be added as needed.

