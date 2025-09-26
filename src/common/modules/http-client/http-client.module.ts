// src/http-client/http-client.module.ts
import { HttpModule, HttpService } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { HttpUpstreamError } from '@src/common/errors/axios.error';
import { HttpClientService } from './http-client.service';

@Global() // make it available app-wide without re-importing
@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
      // validateStatus is axios default (2xx). Keep default.
    }),
  ],
  providers: [HttpClientService],
  exports: [HttpClientService],
})
export class HttpClientModule {
  constructor(httpService: HttpService) {
    // Normalize responses/errors once, globally.
    const axios = httpService.axiosRef;

    axios.interceptors.response.use(
      res => res,
      err => {
        // Shape all errors in a consistent way
        if (err.response) {
          // Server replied (non-2xx)
          const { status, data, headers, config } = err.response;

          return Promise.reject(
            new HttpUpstreamError({
              status,
              data,
              headers,
              config,
              message: data?.message || err.message || 'HTTP error',
            }),
          );
        }
        if (err.request) {
          // No response (timeout/DNS/network)
          return Promise.reject(
            new HttpUpstreamError({
              status: null,
              data: null,
              headers: null,
              config: err.config,
              message: err.message || 'No response received',
            }),
          );
        }
        // Something else (setup, serialization…)
        return Promise.reject(
          new HttpUpstreamError({
            status: null,
            data: null,
            headers: null,
            config: err.config,
            message: err.message || 'Axios request error',
          }),
        );
      },
    );
  }
}
