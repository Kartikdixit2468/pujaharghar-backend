# Support Ticket System - API Documentation

## Overview
This document outlines all the endpoints available for the Support Ticket System in the backend API. The ticket system allows users to raise support tickets for issues related to bookings and general inquiries.

## Base URL
```
/api/tickets
```

## Database Table Structure
```sql
tickets (
  id (INT, PRIMARY KEY, AUTO_INCREMENT),
  email (TEXT, NOT NULL),
  phone (TEXT, NOT NULL),
  subject (TEXT, NOT NULL),
  category (TEXT, NOT NULL),
  message (TEXT, NOT NULL),
  booking_id (INT, NULLABLE),
  status (TINYINT(1), DEFAULT: 0)
)
```

### Status Values
- `0` = Open (New/Active ticket)
- `1` = Closed (Resolved/Completed ticket)

---

## Endpoints

### 1. Health Check
**GET** `/`

Returns a health status message for the ticket routes.

**Response:**
```json
{
  "message": "Ticket Support API is running successfully."
}
```

---

### 2. Create Support Ticket
**POST** `/create`

Creates a new support ticket for an authenticated user.

**Authentication:** Required (JWT Token)

**Request Body:**
```json
{
  "phone": "9876543210",
  "subject": "Issue with booking",
  "category": "booking",
  "message": "I have an issue with my recent booking",
  "booking_id": 5 (optional)
}
```

**Required Fields:**
- `subject` (string) - Title/Subject of the ticket
- `category` (string) - Category of the issue (e.g., "booking", "payment", "general")
- `message` (string) - Detailed message about the issue
- `phone` (optional) - User's phone number

**Optional Fields:**
- `booking_id` - Related booking ID if the ticket is about a specific booking

**Response (Success - 201):**
```json
{
  "success": true,
  "ticket_id": 1,
  "message": "Support ticket created successfully."
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Subject, category, and message are required."
}
```

---

### 3. Get User's Tickets
**GET** `/user/all`

Retrieves all tickets for the authenticated user.

**Authentication:** Required (JWT Token)

**Request Body:**
```json
{
  "phone": "9876543210"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "tickets": [
    {
      "id": 1,
      "email": "user@example.com",
      "phone": "9876543210",
      "subject": "Issue with booking",
      "category": "booking",
      "message": "I have an issue with my recent booking",
      "booking_id": 5,
      "status": 0
    }
  ]
}
```

---

### 4. Get Ticket Details
**GET** `/details/:ticket_id`

Retrieves detailed information about a specific ticket.

**Authentication:** Required (JWT Token)

**Parameters:**
- `ticket_id` (integer) - The ID of the ticket

**Request Body:**
```json
{
  "phone": "9876543210"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "ticket": {
    "id": 1,
    "email": "user@example.com",
    "phone": "9876543210",
    "subject": "Issue with booking",
    "category": "booking",
    "message": "I have an issue with my recent booking",
    "booking_id": 5,
    "status": 0
  }
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Ticket not found."
}
```

---

### 5. Get All Tickets (Admin)
**GET** `/admin/all`

Retrieves all support tickets in the system (for admin/support team).

**Authentication:** Not required (internal use)

**Response (Success - 200):**
```json
{
  "success": true,
  "tickets": [
    {
      "id": 1,
      "email": "user@example.com",
      "phone": "9876543210",
      "subject": "Issue with booking",
      "category": "booking",
      "message": "I have an issue with my recent booking",
      "booking_id": 5,
      "status": 0
    },
    {
      "id": 2,
      "email": "another@example.com",
      "phone": "8765432109",
      "subject": "Payment issue",
      "category": "payment",
      "message": "I was charged twice",
      "booking_id": null,
      "status": 0
    }
  ]
}
```

---

### 6. Get Tickets by Status
**GET** `/admin/status/:status`

Retrieves all tickets filtered by status.

**Authentication:** Not required (internal use)

**Parameters:**
- `status` (integer) - Status filter: 0 (open) or 1 (closed)

**Response (Success - 200):**
```json
{
  "success": true,
  "tickets": [
    {
      "id": 1,
      "email": "user@example.com",
      "phone": "9876543210",
      "subject": "Issue with booking",
      "category": "booking",
      "message": "I have an issue with my recent booking",
      "booking_id": 5,
      "status": 0
    }
  ]
}
```

---

### 7. Get Tickets by Category
**GET** `/admin/category/:category`

Retrieves all tickets filtered by category.

**Authentication:** Not required (internal use)

**Parameters:**
- `category` (string) - Category filter (e.g., "booking", "payment", "general")

**Response (Success - 200):**
```json
{
  "success": true,
  "tickets": [
    {
      "id": 1,
      "email": "user@example.com",
      "phone": "9876543210",
      "subject": "Issue with booking",
      "category": "booking",
      "message": "I have an issue with my recent booking",
      "booking_id": 5,
      "status": 0
    }
  ]
}
```

---

### 8. Update Ticket Status
**PUT** `/admin/update-status/:ticket_id`

Updates the status of a support ticket (for admin/support team).

**Authentication:** Not required (internal use)

**Parameters:**
- `ticket_id` (integer) - The ID of the ticket to update

**Request Body:**
```json
{
  "status": 1
}
```

**Status Values:**
- `0` - Open
- `1` - Closed

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Ticket status updated successfully."
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Invalid status. Status must be 0 (open) or 1 (closed)."
}
```

---

## Error Responses

### 403 Unauthorized
```json
{
  "success": false,
  "error": "Invalid User or Token"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server error while [operation]."
}
```

---

## File Structure

### Files Created/Modified:
1. **`src/services/ticketService.js`** - Service layer containing all ticket business logic
2. **`src/routes/ticket_routes.js`** - Route handlers for ticket endpoints
3. **`src/app.js`** - Updated to include ticket routes

### Service Methods Available:
- `createTicket(email, phone, ticketData)` - Create a new ticket
- `getUserTickets(email, phone)` - Get user's tickets
- `getTicketDetails(ticket_id)` - Get specific ticket
- `updateTicketStatus(ticket_id, status)` - Update ticket status
- `getAllTickets()` - Get all tickets (admin)
- `getTicketsByStatus(status)` - Filter by status
- `getTicketsByCategory(category)` - Filter by category

---

## Usage Examples

### Example 1: Create a Ticket (cURL)
```bash
curl -X POST http://localhost:5000/api/tickets/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "phone": "9876543210",
    "subject": "Issue with my booking",
    "category": "booking",
    "message": "I cannot access my booking details",
    "booking_id": 5
  }'
```

### Example 2: Get User's Tickets (cURL)
```bash
curl -X GET http://localhost:5000/api/tickets/user/all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "phone": "9876543210"
  }'
```

### Example 3: Update Ticket Status (cURL)
```bash
curl -X PUT http://localhost:5000/api/tickets/admin/update-status/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": 1
  }'
```

---

## Notes

- All user-specific endpoints require JWT authentication
- Admin endpoints are currently accessible without authentication (consider adding admin middleware in production)
- The `booking_id` field is optional and can be null for general inquiries
- Status `0` indicates open tickets, `1` indicates resolved/closed tickets
- Tickets are returned sorted by ID in descending order (newest first)
