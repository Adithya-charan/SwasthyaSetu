import { NextRequest, NextResponse } from 'next/server';

// Mock appointments for "my" - assuming patient view
const myAppointments = [
  { id: 1, patient: 'Current Patient', doctor: 'Dr. Sarah Smith', date: 'Apr 18, 2026 - 10:00 AM', status: 'PENDING' as const },
  { id: 2, patient: 'Current Patient', doctor: 'Dr. John Doe', date: 'Apr 19, 2026 - 02:30 PM', status: 'CONFIRMED' as const },
];

export async function GET(request: NextRequest) {
  // For "my" appointments - in real app, would filter by logged-in user
  return NextResponse.json({ appointments: myAppointments });
}