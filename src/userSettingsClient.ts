import { configureStore } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { configureTaskApi, emptySplitApi } from './emptyApi';
import {
  userSettingsApi,
  type UpdateUserSettingsRequest,
  type UserSettings,
} from './userSettingsApi';

export type UserSettingsClientOptions = {
  baseUrl: string;
  fetcher?: typeof fetch;
  accessTokenProvider?: () => string | null;
};

export class UserSettingsError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export class UserSettingsClient {
  private readonly store = configureStore({
    reducer: {
      [emptySplitApi.reducerPath]: emptySplitApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(emptySplitApi.middleware),
  });

  constructor(options: UserSettingsClientOptions) {
    configureTaskApi(options.baseUrl, options.accessTokenProvider, options.fetcher);
  }

  mine(): Promise<UserSettings> {
    return this.unwrap(
      this.store.dispatch(
        userSettingsApi.endpoints.readMyUserSettings.initiate(undefined, {
          subscribe: false,
          forceRefetch: true,
        }),
      ),
    );
  }

  updateMine(request: UpdateUserSettingsRequest): Promise<UserSettings> {
    return this.unwrap(
      this.store.dispatch(
        userSettingsApi.endpoints.updateMyUserSettings.initiate({
          updateUserSettingsRequest: request,
        }),
      ),
    );
  }

  user(userId: number): Promise<UserSettings> {
    return this.unwrap(
      this.store.dispatch(
        userSettingsApi.endpoints.readUserSettings.initiate(
          { userId },
          { subscribe: false, forceRefetch: true },
        ),
      ),
    );
  }

  updateUser(userId: number, request: UpdateUserSettingsRequest): Promise<UserSettings> {
    return this.unwrap(
      this.store.dispatch(
        userSettingsApi.endpoints.updateUserSettings.initiate({
          userId,
          updateUserSettingsRequest: request,
        }),
      ),
    );
  }

  anonymous(): Promise<UserSettings> {
    return this.unwrap(
      this.store.dispatch(
        userSettingsApi.endpoints.readAnonymousUserSettings.initiate(undefined, {
          subscribe: false,
          forceRefetch: true,
        }),
      ),
    );
  }

  updateAnonymous(request: UpdateUserSettingsRequest): Promise<UserSettings> {
    return this.unwrap(
      this.store.dispatch(
        userSettingsApi.endpoints.updateAnonymousUserSettings.initiate({
          updateUserSettingsRequest: request,
        }),
      ),
    );
  }

  private async unwrap<T>(request: { unwrap(): Promise<T> }): Promise<T> {
    try {
      return await request.unwrap();
    } catch (error) {
      if (isFetchBaseQueryError(error)) {
        throw new UserSettingsError(
          `API request failed with HTTP ${error.status}`,
          Number(error.status),
        );
      }
      throw error;
    }
  }
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error;
}
