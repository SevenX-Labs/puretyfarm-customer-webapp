# PuretyFarm Backend API Contract & Cutover Specifications

This document defines the strict API specification, authentication requirements, session cookie contracts, and persistence constraints required for the backend service replacing the in-repo mock server.

---

## 1. Persistence & Serverless Lifecycle Report

### Analysis of `src/server/db/store.ts` in Serverless Environments
- **Local Dev vs. Production Serverless:**
  In local development, `src/server/db/store.ts` synchronizes with a local JSON file (`.dev-db.json`) and a Node `global.__pf_db__` cache.
- **Serverless Limitations (Vercel, AWS Lambda, Cloud Run):**
  - **Read-Only Filesystem:** Serverless functions execute in read-only containers (only `/tmp` is writable). Writes to `process.cwd()/.dev-db.json` fail or write to ephemeral memory.
  - **Ephemeral Execution Contexts:** Each cold start spins up a fresh container with an empty in-memory state.
- **State Lost on Cold Start or Redeployment:**
  1. **Users:** Any user created after container boot is lost.
  2. **Active OTPs:** All in-flight OTP records and cooldown timers are wiped.
  3. **Rate Limits:** In-memory IP rate limits in `src/server/auth/security.ts` and `src/app/api/serviceability/check/route.ts` are reset.
  4. **Orders & Subscriptions:** All sample orders, starter trials, and subscription statuses created in runtime are lost.
  5. **Delivery Addresses:** Customer addresses added during onboarding or account management are wiped.

> [!CRITICAL]
> The backend repository MUST persist all state in an ACID-compliant database (e.g. PostgreSQL, Supabase, or MySQL). It must not rely on ephemeral file or process memory.

---

## 2. Authentication & Session Contract

To ensure that existing customer sessions remain valid during and after the backend cutover, the backend service must use byte-identical session handling.

| Parameter | Specification | Details |
| :--- | :--- | :--- |
| **Cookie Name** | `pf_session` | Case-sensitive HTTP cookie name |
| **Token Format** | JWT (JSON Web Token) | Encoded via JOSE standard |
| **Signing Algorithm** | `HS256` (HMAC SHA-256) | Must match `jwtVerify` header |
| **Secret Env Var** | `AUTH_SECRET` | Shared secret string (minimum 32 characters) |
| **Token Validity** | `30d` (30 days) | Expiration timestamp in seconds |
| **Cookie Flags** | `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=2592000` | `Secure: true` in production (HTTPS) |

### JWT Payload Schema
```json
{
  "userId": "usr_1791217158108_ofa4m",
  "phone": "+919876565926",
  "name": "Anand Agrawal",
  "iat": 1791217158,
  "exp": 1793809158
}
```

---

## 3. API Endpoints Specification

All endpoints must be mounted under the `/api` prefix.

### 3.1 Authentication

#### `POST /api/auth/send-otp`
- **Request Body:**
  ```json
  {
    "phone": "9876543210"
  }
  ```
- **Responses:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "message": "6-digit OTP sent successfully.",
      "cooldownSeconds": 30,
      "devOtpHint": "123456" // ONLY in non-production
    }
    ```
  - `429 Too Many Requests`:
    ```json
    {
      "success": false,
      "error": "Please wait 30 seconds before requesting another code.",
      "remainingCooldown": 28
    }
    ```

#### `POST /api/auth/verify-otp`
- **Request Body:**
  ```json
  {
    "phone": "9876543210",
    "code": "123456"
  }
  ```
- **Responses:**
  - `200 OK`: Sets `Set-Cookie: pf_session=...`
    ```json
    {
      "success": true,
      "message": "Account created successfully!",
      "isNewUser": false,
      "onboardingStep": "complete",
      "user": {
        "id": "usr_12345",
        "phone": "+919876543210",
        "name": "Rahul Sharma",
        "email": "rahul@example.com",
        "avatarUrl": ""
      }
    }
    ```
  - `400 Bad Request`:
    ```json
    {
      "success": false,
      "error": "Invalid verification code. Please check and try again."
    }
    ```

#### `POST /api/auth/logout`
- **Request:** Cookie `pf_session`
- **Responses:**
  - `200 OK`: Clears `pf_session` cookie (`Max-Age=0`).
    ```json
    {
      "success": true,
      "message": "Logged out successfully."
    }
    ```

---

### 3.2 Current User Profile (`/api/me`)

#### `GET /api/me`
- **Request:** Cookie `pf_session`
- **Responses:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "onboardingStep": "complete", // profile_pending | location_pending | plan_pending | complete
      "user": {
        "id": "usr_12345",
        "phone": "+919876543210",
        "name": "Rahul Sharma",
        "email": "rahul@example.com",
        "avatarUrl": "https://..."
      }
    }
    ```
  - `401 Unauthorized`:
    ```json
    {
      "success": false,
      "error": "Authentication required."
    }
    ```

#### `PATCH /api/me`
- **Request Body:**
  ```json
  {
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "avatarUrl": "https://..."
  }
  ```
- **Responses:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "message": "Profile updated successfully.",
      "onboardingStep": "location_pending",
      "user": { ... }
    }
    ```

---

### 3.3 Delivery Addresses (`/api/addresses`)

#### `GET /api/addresses`
- **Responses:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "addresses": [
        {
          "id": "addr_123",
          "userId": "usr_123",
          "fullName": "Rahul Sharma",
          "phone": "+919876543210",
          "alternatePhone": "",
          "street": "Flat 302, Palm Heights",
          "locality": "Shankar Nagar",
          "landmark": "Near Magneto Mall",
          "city": "Raipur",
          "pincode": "492007",
          "addressType": "Home",
          "isDefault": true,
          "isServiceable": true,
          "createdAt": "2026-10-05T12:00:00.000Z"
        }
      ]
    }
    ```

#### `POST /api/addresses`
- **Request Body:**
  ```json
  {
    "fullName": "Rahul Sharma",
    "phone": "+919876543210",
    "street": "Flat 302, Palm Heights",
    "locality": "Shankar Nagar",
    "city": "Raipur",
    "pincode": "492007",
    "addressType": "Home",
    "isDefault": true
  }
  ```
- **Responses:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "message": "Delivery address verified and saved.",
      "address": { ... }
    }
    ```

#### `PATCH /api/addresses/:id` & `DELETE /api/addresses/:id`
- Modifies or deletes the specific address owned by the authenticated user.

---

### 3.4 Serviceability (`/api/serviceability/check`)

#### `POST /api/serviceability/check`
- **Request Body:**
  ```json
  {
    "pincode": "492007",
    "addressText": "Shankar Nagar, Raipur"
  }
  ```
  *(Or `{ "lat": 21.2514, "lng": 81.6296 }` for GPS reverse geocode).*
- **Responses:**
  - `200 OK` (Serviceable):
    ```json
    {
      "success": true,
      "serviceable": true,
      "areaName": "Shankar Nagar",
      "pincode": "492007"
    }
    ```
  - `200 OK` (Unserviceable):
    ```json
    {
      "success": true,
      "serviceable": false,
      "areaName": "",
      "pincode": "110001",
      "reason": "PuretyFarm milk delivery hasn't reached your area yet. We're expanding rapidly across Raipur!"
    }
    ```

---

### 3.5 Orders & Subscriptions

#### `GET /api/orders` & `POST /api/orders`
- Returns order history or places a new one-time / sample bottle order (`₹85`) or starter trial (`₹525`).

#### `GET /api/subscription` & `PATCH /api/subscription`
- Manages active subscription plan and status toggle (`active` vs `paused` for vacation mode).

#### `POST /api/onboarding/complete-plan`
- **Request Body:**
  ```json
  {
    "planId": "trial",
    "addressId": "addr_123"
  }
  ```
- **Responses:**
  - `200 OK`: Creates the starter subscription, places initial order, updates user `onboardingStep: "complete"`.
