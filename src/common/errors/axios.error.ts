// src/http-client/http-errors.ts
import type { AxiosError, AxiosRequestConfig, AxiosResponseHeaders } from 'axios';

export type AxiosLikeHeaders = AxiosResponseHeaders | Record<string, string> | null;

export class HttpUpstreamError<TData = unknown> extends Error {
  /** Always true so you can detect it quickly */
  public readonly isAxiosError = true as const;

  /** HTTP status or null if no response (timeout/DNS/etc.) */
  public readonly status: number | null;

  /** Response body, if any */
  public readonly data: TData | null;

  /** Response headers, if any */
  public readonly headers: AxiosLikeHeaders;

  /** Original Axios request config (useful for debugging) */
  public readonly config?: AxiosRequestConfig;

  constructor(args: {
    status: number | null;
    data: TData | null;
    headers: AxiosLikeHeaders;
    config?: AxiosRequestConfig;
    message?: string;
    cause?: unknown;
  }) {
    super(args.message ?? 'HTTP error', { cause: args.cause });
    this.name = 'HttpUpstreamError';
    this.status = args.status;
    this.data = args.data;
    this.headers = args.headers ?? null;
    this.config = args.config;

    // Maintain proper stack (V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpUpstreamError);
    }
  }

  /** Build from any thrown value; nicely handles AxiosError and non-Axios errors */
  static from<T = unknown>(err: unknown): HttpUpstreamError<T> {
    // If it's already our custom error, return as-is
    if (err instanceof HttpUpstreamError) return err as HttpUpstreamError<T>;

    // If it's an AxiosError
    const ax = err as AxiosError<T>;
    if (ax && typeof ax === 'object' && 'isAxiosError' in ax) {
      const status = ax.response?.status ?? null;
      const data = (ax.response?.data ?? null) as T | null;
      const headers = (ax.response?.headers ?? null) as AxiosLikeHeaders;
      const config = ax.config;
      const message = (data as any)?.message || ax.message || 'HTTP error';

      return new HttpUpstreamError<T>({
        status,
        data,
        headers,
        config,
        message,
        cause: err,
      });
    }

    // Fallback for non-Axios errors
    const message = (err as any)?.message ?? 'HTTP error';
    return new HttpUpstreamError<T>({
      status: null,
      data: null,
      headers: null,
      message,
      cause: err,
    });
  }

  /** Narrowing helper */
  static isUpstreamError(u: unknown): u is HttpUpstreamError {
    return u instanceof HttpUpstreamError || (!!u && (u as any).isAxiosError === true);
  }

  /** Useful for structured logging */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      isAxiosError: this.isAxiosError,
      status: this.status,
      data: this.data,
      headers: this.headers,
      // avoid logging secrets; config can be large
      url: this.config?.url,
      method: this.config?.method,
      timeout: this.config?.timeout,
    };
  }
}
