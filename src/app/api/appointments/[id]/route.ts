import { NextRequest, NextResponse } from 'next/server';

// This would normally be in a database, but for now using the same mock data
// In a real app, you'd have a shared data store
const appointments = [
  { id: 1, patient: 'Alice Walker', doctor: 'Dr. Sarah Smith', date: 'Apr 18, 2026 - 10:00 AM', status: 'PENDING' as const },
  { id: 2, patient: 'Bob Smith', doctor: 'Dr. John Doe', date: 'Apr 18, 2026 - 02:30 PM', status: 'CONFIRMED' as const },
  { id: 3, patient: 'Emily Chen', doctor: 'Dr. Sarah Smith', date: 'Apr 19, 2026 - 11:15 AM', status: 'COMPLETED' as const },
  { id: 4, patient: 'John Doe', doctor: 'Dr. Michael Brown', date: 'Apr 20, 2026 - 09:00 AM', status: 'CANCELLED' as const },
  { id: 5, patient: 'Maria Garcia', doctor: 'Dr. Sarah Smith', date: 'Apr 21, 2026 - 03:45 PM', status: 'PENDING' as const },
  { id: 6, patient: 'David Lee', doctor: 'Dr. John Doe', date: 'Apr 22, 2026 - 01:00 PM', status: 'CONFIRMED' as const },
];

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const body = await request.json();

  const appointment = appointments.find(a => a.id === id);
  if (!appointment) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  }

  appointment.status = body.status;
  return NextResponse.json({ appointment });
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const appointment = appointments.find(a => a.id === id);
  if (!appointment) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  }
  return NextResponse.json({ appointment });
}