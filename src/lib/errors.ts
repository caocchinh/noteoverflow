export const ERROR_CODES = {
  BAD_REQUEST: "bad-request",
  UNAUTHORIZED: "unauthorized",
  FORBIDDEN: "forbidden",
  NOT_FOUND: "not-found",
  BOOKMARK_LIST_NOT_FOUND: "bookmark-list-not-found",
  INTERNAL_SERVER_ERROR: "internal-server-error",
  UNKNOWN_ERROR: "unknown-error",
} as const;

// User-friendly error messages
export const ERROR_MESSAGES = {
  [ERROR_CODES.BAD_REQUEST]: "Bad Request",
  [ERROR_CODES.UNAUTHORIZED]: "Unauthorized",
  [ERROR_CODES.FORBIDDEN]: "This list is private",
  [ERROR_CODES.NOT_FOUND]: "Not Found",
  [ERROR_CODES.BOOKMARK_LIST_NOT_FOUND]: "Bookmark list not found",
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: "An error occurred",
  [ERROR_CODES.UNKNOWN_ERROR]: "An unknown error occurred",
} as const;

// HTTP status codes for API responses
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
