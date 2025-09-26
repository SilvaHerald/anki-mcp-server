// src/http-client/http-client.service.ts
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { RequestOptions, RetryOptions } from '@src/common/modules/http-client/http-client.types';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HttpClientService {
  private readonly logger = new Logger(HttpClientService.name);

  constructor(private readonly http: HttpService) {}

  // ---------- Public helpers (typed) ----------
  async get<T = any>(url: string, opts: RequestOptions = {}) {
    return this.requestWithRetry<T>('GET', url, undefined, opts);
  }

  async delete<T = any>(url: string, opts: RequestOptions = {}) {
    return this.requestWithRetry<T>('DELETE', url, undefined, opts);
  }

  async post<T = any, D = any>(url: string, body?: D, opts: RequestOptions = {}) {
    return this.requestWithRetry<T, D>('POST', url, body, opts);
  }

  async put<T = any, D = any>(url: string, body?: D, opts: RequestOptions = {}) {
    return this.requestWithRetry<T, D>('PUT', url, body, opts);
  }

  async patch<T = any, D = any>(url: string, body?: D, opts: RequestOptions = {}) {
    return this.requestWithRetry<T, D>('PATCH', url, body, opts);
  }

  // ---------- Core request w/ retry/backoff ----------
  private async requestWithRetry<T, D = any>(
    method: AxiosRequestConfig['method'],
    url: string,
    data?: D,
    opts: RequestOptions = {},
  ): Promise<T> {
    const {
      headers,
      params,
      timeoutMs,
      retry = {},
      // signal,  // enable if you add cancellation
    } = opts;

    const config: AxiosRequestConfig<D> = {
      method,
      url,
      data,
      headers,
      params,
      timeout: timeoutMs,
      // signal,
      // NOTE: we return .data globally via interceptor,
      // so caller receives T directly.
      validateStatus: undefined, // keep Axios default (2xx); interceptor handles errors
    };

    const retryCfg: Required<RetryOptions> = {
      retries: retry.retries ?? 0,
      minDelayMs: retry.minDelayMs ?? 250,
      factor: retry.factor ?? 2,
      retryOn: retry.retryOn ?? [408, 429, 500, 502, 503, 504],
    };

    let attempt = 0;

    while (true) {
      try {
        this.logRequest(method!, url, params);

        const result = await firstValueFrom(this.http.request<T>(config));

        return result.data;
      } catch (err: any) {
        attempt += 1;

        const status = err?.status ?? null;

        const shouldRetry =
          attempt <= retryCfg.retries && (status === null || retryCfg.retryOn.includes(status));

        this.logError(method!, url, status, attempt, retryCfg.retries, err?.message);

        if (!shouldRetry) throw err;

        // Exponential backoff
        const delay = retryCfg.minDelayMs * Math.pow(retryCfg.factor, attempt - 1);

        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  // ---------- Logging helpers ----------
  private logRequest(method: string, url: string, params?: Record<string, any>) {
    // Swap to your Winston logger if preferred
    this.logger.debug(`[HTTP] ${method} ${url}${params ? ' ' + JSON.stringify(params) : ''}`);
  }

  private logError(
    method: string,
    url: string,
    status: number | null,
    attempt: number,
    max: number,
    message?: string,
  ) {
    this.logger.warn(
      `[HTTP] ${method} ${url} failed (status=${status ?? 'n/a'}) attempt ${attempt}/${max} - ${message ?? ''}`,
    );
  }
}
