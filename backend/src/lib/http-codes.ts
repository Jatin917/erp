export const HTTP_STATUS = {
  // ✅ Success responses
  OK: 200,                        // Standard response for success
  CREATED: 201,                   // Resource created successfully
  ACCEPTED: 202,                  // Request accepted for processing
  NO_CONTENT: 204,                // Request succeeded but no body to return

  // ⚠️ Client error responses
  BAD_REQUEST: 400,               // Malformed request / validation error
  UNAUTHORIZED: 401,              // Authentication required
  PAYMENT_REQUIRED: 402,          // Reserved (can use for unpaid subscription if needed)
  FORBIDDEN: 403,                 // User not allowed to access this resource
  NOT_FOUND: 404,                 // Resource not found
  METHOD_NOT_ALLOWED: 405,        // HTTP method not supported
  CONFLICT: 409,                  // Conflict with current state (e.g., duplicate record)
  UNPROCESSABLE_ENTITY: 422,      // Validation error (fields correct format but invalid)
  TOO_MANY_REQUESTS: 429,         // Rate limiting

  // ❌ Server error responses
  INTERNAL_SERVER_ERROR: 500,     // Generic server error
  NOT_IMPLEMENTED: 501,           // API not implemented
  BAD_GATEWAY: 502,               // Invalid response from upstream server
  SERVICE_UNAVAILABLE: 503,       // Server temporarily unavailable
  GATEWAY_TIMEOUT: 504            // Upstream server timeout
} as const;
