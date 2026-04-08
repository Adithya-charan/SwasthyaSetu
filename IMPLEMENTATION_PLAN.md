# Implementation Plan: Fixing Vercel Deployment & Backend Integration

The user is facing issues with Vercel deployment: video not connecting across tabs, database not storing data, role-based dashboards not fully functional, and console errors.

## Problem Analysis
1.  **Connectivity & Security (Mixed Content)**: Vercel serves over `https`. If the backend is on `http`, browsers block requests. Handling of `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` needs to be dynamic.
2.  **WebSocket/WebRTC Signaling**: The signaling server port (8080) is hardcoded or incorrectly guessed for Vercel, leading to "Connection Refused" or "Mixed Content" errors.
3.  **Mock Data vs. Live Data**: Most dashboards (`Admin`, `Doctor`, etc.) use `MOCK_DATA`. The `AuthContext` has a fallback to a mock user. This is why data is "not storing"—it's not being sent to the backend.
4.  **Role Access**: Incorrect redirect paths or failed authentication logic (using local storage mocks) might prevent proper dashboard loading.

## Detailed Steps

### Phase 1: Fixing Infrastructure & Security
1.  **Update `AuthContext.tsx`**:
    *   Implement dynamic protocol detection (`https` vs `http`).
    *   Ensure `NEXT_PUBLIC_API_URL` defaults to a secure version if on Vercel.
2.  **Update `VideoConsult.tsx`**:
    *   Fix `wsBase` to use `wss` if the page is `https`.
    *   Remove hardcoded `:8080` for the signaling server in production.

### Phase 2: Connecting Dashboards to Backend
1.  **Implement API Services**: Create centralized fetch logic that handles base URLs and authorization headers.
2.  **Connect Admin Dashboard**: Replace pie/bar chart mock data with real platform stats.
3.  **Connect Doctor Dashboard**: Fetch real appointments for the logged-in doctor.
4.  **Connect Patient Dashboard**: Fetch real prescriptions and medical history.

### Phase 3: Final Polishing & Verification
1.  **Handle Console Errors**: Audit for common Vercel errors.
2.  **Verify WebRTC**: Ensure signaling works between a 'Doctor' tab and a 'Patient' tab.
