// src/http-client/http-client.types.ts
export type Query = Record<string, string | number | boolean | undefined | null>;

export type RetryOptions = {
  retries?: number; // default 0
  minDelayMs?: number; // default 250
  factor?: number; // backoff factor, default 2
  retryOn?: number[]; // HTTP codes to retry on, default [408, 429, 500, 502, 503, 504]
};

export type RequestOptions = {
  headers?: Record<string, string>;
  params?: Query;
  timeoutMs?: number; // override default timeout
  retry?: RetryOptions;
  // You can add signal?: AbortSignal here if you want cancellation.
};
