import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

let apiBaseUrl = 'http://localhost:8080';
let accessTokenProvider: () => string | null = () => null;
let apiFetch: typeof fetch | undefined;

export function configureTaskApi(
  baseUrl: string,
  getAccessToken: () => string | null = accessTokenProvider,
  fetcher?: typeof fetch,
) {
  apiBaseUrl = baseUrl.replace(/\/$/, '');
  accessTokenProvider = getAccessToken;
  apiFetch = fetcher;
}

// PDFs bypass the JSON-oriented RTK cache so Blob objects never enter Redux state.
export function requestTaskPdf(path: string, ids?: number[]): Promise<Response> {
  const headers = new Headers({ Accept: 'application/pdf' });
  const token = accessTokenProvider();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (ids) headers.set('Content-Type', 'application/json');
  return (apiFetch ?? fetch)(
    new Request(`${apiBaseUrl}${path}`, {
      method: ids ? 'POST' : 'GET',
      headers,
      body: ids ? JSON.stringify({ ids }) : undefined,
    }),
  );
}

const dynamicBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const normalizedArgs = typeof args === 'string' ? args : { ...args };
  if (typeof normalizedArgs !== 'string' && normalizedArgs.url.endsWith('/export.csv')) {
    normalizedArgs.responseHandler = 'text';
  }
  if (typeof normalizedArgs !== 'string' && normalizedArgs.url.endsWith('/import.csv')) {
    const headers = new Headers(normalizedArgs.headers as HeadersInit | undefined);
    headers.set('Content-Type', 'text/csv');
    normalizedArgs.headers = headers;
  }

  const baseQuery = fetchBaseQuery({
    baseUrl: apiBaseUrl,
    fetchFn: apiFetch,
    prepareHeaders: (headers) => {
      const token = accessTokenProvider();
      const url = typeof normalizedArgs === 'string' ? normalizedArgs : normalizedArgs.url;
      if (token && url !== '/api/v1/auth/login') headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  });

  return baseQuery(normalizedArgs, api, extraOptions);
};

export const emptySplitApi = createApi({
  reducerPath: 'splitApi',
  baseQuery: dynamicBaseQuery,
  endpoints: () => ({}),
});
