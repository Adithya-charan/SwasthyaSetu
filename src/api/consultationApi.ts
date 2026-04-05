/**
 * Consultation API Service (Spring Boot Placeholder)
 */
export const consultationApi = {
    getRoomDetails: async (roomId: string) => {
        // REPLACE WITH: return await fetch(`/api/consultations/${roomId}`);
        return { success: true, status: 'active' };
    },
    endConsultation: async (roomId: string) => {
        // REPLACE WITH: return await fetch(`/api/consultations/${roomId}/end`, { method: 'POST' });
        return { success: true };
    }
};
