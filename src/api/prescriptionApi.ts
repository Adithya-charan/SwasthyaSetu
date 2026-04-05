/**
 * Prescription API Service (Spring Boot Placeholder)
 */
export const prescriptionApi = {
    submitPrescription: async (roomId: string, prescriptionData: any) => {
        // REPLACE WITH: return await fetch(`/api/prescriptions/submit`, { method: 'POST', body: JSON.stringify(prescriptionData) });
        return { success: true };
    },
    getPatientPrescriptions: async (patientId: string) => {
        // REPLACE WITH: return await fetch(`/api/prescriptions?patientId=${patientId}`);
        return { success: true, data: [] };
    }
};
