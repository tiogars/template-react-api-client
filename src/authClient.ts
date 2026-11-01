import { configureStore } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import {
  authApi,
  type CreateRoleRequest,
  type CreateUserRequest,
  type DeleteSelectedResponse,
  type LoginResponse,
  type Role,
  type UpdateRoleRequest,
  type UpdateUserRequest,
  type User,
} from './authApi';
import { configureTaskApi, emptySplitApi } from './emptyApi';

export type AuthClientOptions = {
  baseUrl: string;
  fetcher?: typeof fetch;
  accessTokenProvider?: () => string | null;
};

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export class AuthClient {
  private readonly store = configureStore({
    reducer: {
      [emptySplitApi.reducerPath]: emptySplitApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(emptySplitApi.middleware),
  });

  constructor(options: AuthClientOptions) {
    configureTaskApi(options.baseUrl, options.accessTokenProvider, options.fetcher);
  }

  login(username: string, password: string): Promise<LoginResponse> {
    return this.unwrap(
      this.store.dispatch(
        authApi.endpoints.login.initiate({ loginRequest: { username, password } }),
      ),
    );
  }

  me(): Promise<User> {
    return this.unwrap(
      this.store.dispatch(
        authApi.endpoints.me.initiate(undefined, { subscribe: false, forceRefetch: true }),
      ),
    );
  }

  users(): Promise<User[]> {
    return this.unwrap(
      this.store.dispatch(
        authApi.endpoints.listUsers.initiate(undefined, { subscribe: false, forceRefetch: true }),
      ),
    );
  }

  user(id: number): Promise<User> {
    return this.unwrap(
      this.store.dispatch(
        authApi.endpoints.readUser.initiate({ id }, { subscribe: false, forceRefetch: true }),
      ),
    );
  }

  createUser(request: CreateUserRequest): Promise<User> {
    return this.unwrap(
      this.store.dispatch(authApi.endpoints.createUser.initiate({ createUserRequest: request })),
    );
  }

  updateUser(id: number, request: UpdateUserRequest): Promise<User> {
    return this.unwrap(
      this.store.dispatch(
        authApi.endpoints.updateUser.initiate({ id, updateUserRequest: request }),
      ),
    );
  }

  async deleteUser(id: number): Promise<void> {
    await this.unwrap(this.store.dispatch(authApi.endpoints.deleteUser.initiate({ id })));
  }

  deleteUsers(ids: number[]): Promise<DeleteSelectedResponse> {
    return this.unwrap(
      this.store.dispatch(
        authApi.endpoints.deleteSelectedUsers.initiate({ deleteSelectedRequest: { ids } }),
      ),
    );
  }

  roles(): Promise<Role[]> {
    return this.unwrap(
      this.store.dispatch(
        authApi.endpoints.listRoles.initiate(undefined, { subscribe: false, forceRefetch: true }),
      ),
    );
  }

  role(id: number): Promise<Role> {
    return this.unwrap(
      this.store.dispatch(
        authApi.endpoints.readRole.initiate({ id }, { subscribe: false, forceRefetch: true }),
      ),
    );
  }

  createRole(request: CreateRoleRequest): Promise<Role> {
    return this.unwrap(
      this.store.dispatch(authApi.endpoints.createRole.initiate({ createRoleRequest: request })),
    );
  }

  updateRole(id: number, request: UpdateRoleRequest): Promise<Role> {
    return this.unwrap(
      this.store.dispatch(
        authApi.endpoints.updateRole.initiate({ id, updateRoleRequest: request }),
      ),
    );
  }

  async deleteRole(id: number): Promise<void> {
    await this.unwrap(this.store.dispatch(authApi.endpoints.deleteRole.initiate({ id })));
  }

  deleteRoles(ids: number[]): Promise<DeleteSelectedResponse> {
    return this.unwrap(
      this.store.dispatch(
        authApi.endpoints.deleteSelectedRoles.initiate({ deleteSelectedRequest: { ids } }),
      ),
    );
  }

  private async unwrap<T>(request: { unwrap(): Promise<T> }): Promise<T> {
    try {
      return await request.unwrap();
    } catch (error) {
      if (isFetchBaseQueryError(error)) {
        throw new AuthError(`API request failed with HTTP ${error.status}`, Number(error.status));
      }
      throw error;
    }
  }
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error;
}
