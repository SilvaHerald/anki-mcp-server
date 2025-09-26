export interface AnkiConnectPayload<T = any> {
  action: string;
  version: number;
  params: T;
}

export interface AnkiConnectResponse {
  result: number | null;
  error: string | null;
}
