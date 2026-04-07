# Postman API Testing Guide for SwasthyaSetu

This guide provides a comprehensive setup for testing the SwasthyaSetu Backend API using Postman. The configuration is designed to align with the **React Context API** authentication flow used in the frontend.

## 1. Collection Structure
**Collection Name:** `Healthcare-App-API`

### Folders:
- **Auth APIs**: Authentication and profile management.
- **User APIs**: Full CRUD for user management.
- **Appointment APIs**: Full CRUD for healthcare appointments.

---

## 2. Environment Variables Setup
Create a new Environment in Postman and add the following variables:

| Variable | Initial Value | Description |
| :--- | :--- | :--- |
| `base_url` | `http://localhost:5000/api` | Base URL of the backend server |
| `auth_token` | *(Empty)* | Automatically populated after login |
| `user_id` | *(Empty)* | Populated from user profile or register |
| `appointment_id` | *(Empty)* | Populated after creating an appointment |

---

## 3. Automation Script: JWT Token Storage
To simulate the **React AuthContext** behavior, add this script to the **"Tests"** tab of the `POST /api/auth/login` request:

```javascript
// Parse response
const response = pm.response.json();

// If login is successful, store the token and user id
if (response.success && response.token) {
    pm.environment.set("auth_token", response.token);
    pm.environment.set("user_id", response.user.id);
    console.log("Session Started: Token stored in environment.");
}
```

---

## 4. Authentication APIs

### [POST] Register User
- **URL:** `{{base_url}}/auth/register`
- **Body (JSON):**
```json
{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123"
}
```
- **Response (201 Created):** Contains created user details.

### [POST] Login User
- **URL:** `{{base_url}}/auth/login`
- **Body (JSON):**
```json
{
    "email": "jane@example.com",
    "password": "password123"
}
```
- **Tests Tool:** Uses the script in Section 3 to set `{{auth_token}}`.

### [GET] Get Profile (Protected)
- **URL:** `{{base_url}}/auth/profile`
- **Headers:** `Authorization: Bearer {{auth_token}}`
- **Purpose:** Verifies token validity, identical to how `AuthContext` fetches user data on refresh.

### [POST] Logout
- **URL:** `{{base_url}}/auth/logout`
- **Headers:** `Authorization: Bearer {{auth_token}}`
- **Cleanup (Tests Tab):**
```javascript
pm.environment.unset("auth_token");
pm.environment.unset("user_id");
```

---

## 5. CRUD API Details

### User Management
- **GET All Users:** `GET {{base_url}}/users`
- **GET Single User:** `GET {{base_url}}/users/:id`
- **PUT Update User:** `PUT {{base_url}}/users/:id`
- **DELETE User:** `DELETE {{base_url}}/users/:id`

### Appointment Management
- **POST Create:** `POST {{base_url}}/appointments`
- **GET All:** `GET {{base_url}}/appointments`
- **GET One:** `GET {{base_url}}/appointments/:id`
- **PUT Update:** `PUT {{base_url}}/appointments/:id`
- **DELETE Record:** `DELETE {{base_url}}/appointments/:id`

---

## 6. Testing Scenarios & Expected Responses

| Scenario | HTTP Status | Expected Body snippet |
| :--- | :--- | :--- |
| **Valid Login** | 200 OK | `"success": true, "token": "..."` |
| **Expired/Missing Token** | 401 Unauthorized | `"message": "No token provided"` |
| **Invalid Credentials** | 401 Unauthorized | `"message": "Invalid credentials"` |
| **Existing Email Reg** | 400 Bad Request | `"message": "User already exists"` |
| **Invalid Body Fields** | 400/500 | Check `errors` array in response |

---

## 7. API Testing Workflow (Context API Sequence)
1. **Register**: Create a new account.
2. **Login**: Authenticate and capture `auth_token`.
3. **Profile**: Fetch profile to verify session persistence logic.
4. **Create Appointment**: Test data entry.
5. **View List**: Ensure record appears in user's dashboard view.
5. **Update/Delete**: Verify data modification integrity.
7. **Logout**: Ensure token is invalidated/cleared.

---

## 8. Pro-Tip: Global Headers
Instead of adding the Authorization header to every request, click on the **Collection Settings** -> **Authorization** tab:
1. Type: **Bearer Token**
2. Token: `{{auth_token}}`
3. Now all requests in the collection will automatically inherit this token if they are set to `Inherit auth from parent`.
