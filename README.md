# Policy Management API

This repository contains a Node.js Express server to handle policy, user, and agent data, utilizing MongoDB. It features worker threads for efficient CSV parsing and real-time CPU monitoring.

## API Documentation

The server exposes 4 main endpoints mounted under the `/api` route.

---

### 1. Upload CSV Data
Uploads a CSV data sheet containing policy information. The processing is done in the background using Node.js Worker Threads to avoid blocking the main server thread. Data is distributed intelligently across 6 collections (Agent, UserAccount, Lob, Carrier, User, Policy).

- **URL:** `/api/upload`
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `file`: The CSV file to be uploaded.

**Response (Success):**
```json
{
  "message": "Data processing completed. Successfully uploaded: X, Failed or Skipped: Y"
}
```

Curl request:

postman request POST 'http://localhost:9000/api/upload' \
  --header 'Content-Type: multipart/form-data; boundary=<calculated when request is sent>' \
  --form 'file=@/Users/akashagrawal/Developer/policy-assignment/public/uploads/policy_sample.csv'

Sample response:

{
    "message": "Data processing completed. Successfully uploaded: 2, Failed or Skipped: 0"
}

---

### 2. Search Policy by Username
Finds all policy information associated with a user using their username (mapped to the `firstname` field). It deeply populates the related Company, Category, and Agent fields.

- **URL:** `/api/search-policy`
- **Method:** `GET`
- **Query Parameters:** 
  - `username` (string, required): The first name of the user to search for.
  
**Example Request:**
`/api/search-policy?username=Adam`

curl request:
'http://localhost:9000/api/search-policy?username=Adam'

**Response (Success):**
```json
{
  "policies": [
    {
      "_id": "...",
      "policy_no": "11078969988",
      "premium_amount": 5000,
      "company_id": { ... },
      "category_id": { ... },
      "user_id": { ... },
      "agent_id": { ... }
    }
  ]
}
```

---

### 3. Aggregated Policies
Provides an aggregated breakdown of policies for each user. Groups data by user ID and calculates the total premium amount alongside a raw count of how many policies that user owns.

- **URL:** `/api/aggregated-policies`
- **Method:** `GET`


curl request:
'http://localhost:9000/api/aggregated-policies'

**Response (Success):**
```json
{
  "aggregated": [
    {
      "_id": "user_id_here",
      "firstname": "Adam",
      "totalPremium": 5000,
      "policyCount": 1,
      "policies": [
         { ... }
      ]
    }
  ]
}
```

---

### 4. Send Message
A post-service that takes a message alongside a specific day and time, and immediately saves that message into the database.

- **URL:** `/api/send-message`
- **Method:** `POST`
- **Content-Type:** `application/json`
- **Body (JSON):**
  ```json
{
    "message": "This is a test policy message",
    "day": "Monday",
    "time": "2023-10-04T10:30:00.000Z"
}
  ```

curl request:
'http://localhost:9000/api/send-message' \
  --header 'Content-Type: application/json' \
  --body '{
    "message": "This is a test policy message",
    "day": "Monday",
    "time": "2023-10-04T10:30:00.000Z"
}'

**Response (Success):**
```json
{
    "status": 200,
    "data": {
        "message": "This is a test policy message",
        "time": "2023-10-04T10:30:00.000Z",
        "day": "Monday",
        "_id": "6ac22645ddab229ba78ec38b",
        "createdAt": "2026-10-04T10:11:17.181Z",
        "updatedAt": "2026-10-04T10:11:17.181Z"
    },
    "message": "Message saved successfully"
}
```
