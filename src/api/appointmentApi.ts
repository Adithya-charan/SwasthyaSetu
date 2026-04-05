/**
 * Appointment API Service (Spring Boot Placeholder)
 */
export const appointmentApi = {
    getAppointments: async (userId: string, role: string) => {
        // REPLACE WITH: return await fetch(`/api/appointments?userId=${userId}&role=${role}`);
        return { success: true, data: [] };
    },
    bookAppointment: async (appointmentData: any) => {
        // REPLACE WITH: return await fetch('/api/appointments/book', { method: 'POST', body: JSON.stringify(appointmentData) });
        return { success: true };
    }
};
