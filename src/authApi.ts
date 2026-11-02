import { emptySplitApi as api } from "./emptyApi";
export const addTagTypes = ["Authentication", "Users", "Roles"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      login: build.mutation<LoginApiResponse, LoginApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/auth/login`,
          method: "POST",
          body: queryArg.loginRequest,
        }),
        invalidatesTags: ["Authentication"],
      }),
      me: build.query<MeApiResponse, MeApiArg>({
        query: () => ({ url: `/api/v1/auth/me` }),
        providesTags: ["Authentication"],
      }),
      listUsers: build.query<ListUsersApiResponse, ListUsersApiArg>({
        query: () => ({ url: `/api/v1/auth/users` }),
        providesTags: ["Users"],
      }),
      createUser: build.mutation<CreateUserApiResponse, CreateUserApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/auth/users`,
          method: "POST",
          body: queryArg.createUserRequest,
        }),
        invalidatesTags: ["Users"],
      }),
      readUser: build.query<ReadUserApiResponse, ReadUserApiArg>({
        query: (queryArg) => ({ url: `/api/v1/auth/users/${queryArg.id}` }),
        providesTags: ["Users"],
      }),
      updateUser: build.mutation<UpdateUserApiResponse, UpdateUserApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/auth/users/${queryArg.id}`,
          method: "PUT",
          body: queryArg.updateUserRequest,
        }),
        invalidatesTags: ["Users"],
      }),
      deleteUser: build.mutation<DeleteUserApiResponse, DeleteUserApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/auth/users/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Users"],
      }),
      deleteSelectedUsers: build.mutation<
        DeleteSelectedUsersApiResponse,
        DeleteSelectedUsersApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/auth/users/delete-selected`,
          method: "POST",
          body: queryArg.deleteSelectedRequest,
        }),
        invalidatesTags: ["Users"],
      }),
      listRoles: build.query<ListRolesApiResponse, ListRolesApiArg>({
        query: () => ({ url: `/api/v1/auth/roles` }),
        providesTags: ["Roles"],
      }),
      createRole: build.mutation<CreateRoleApiResponse, CreateRoleApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/auth/roles`,
          method: "POST",
          body: queryArg.createRoleRequest,
        }),
        invalidatesTags: ["Roles"],
      }),
      readRole: build.query<ReadRoleApiResponse, ReadRoleApiArg>({
        query: (queryArg) => ({ url: `/api/v1/auth/roles/${queryArg.id}` }),
        providesTags: ["Roles"],
      }),
      updateRole: build.mutation<UpdateRoleApiResponse, UpdateRoleApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/auth/roles/${queryArg.id}`,
          method: "PUT",
          body: queryArg.updateRoleRequest,
        }),
        invalidatesTags: ["Roles"],
      }),
      deleteRole: build.mutation<DeleteRoleApiResponse, DeleteRoleApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/auth/roles/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Roles"],
      }),
      deleteSelectedRoles: build.mutation<
        DeleteSelectedRolesApiResponse,
        DeleteSelectedRolesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/auth/roles/delete-selected`,
          method: "POST",
          body: queryArg.deleteSelectedRequest,
        }),
        invalidatesTags: ["Roles"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as authApi };
export type LoginApiResponse = /** status 200 Authenticated. */ LoginResponse;
export type LoginApiArg = {
  loginRequest: LoginRequest;
};
export type MeApiResponse = /** status 200 Current user. */ User;
export type MeApiArg = void;
export type ListUsersApiResponse = /** status 200 Users returned. */ User[];
export type ListUsersApiArg = void;
export type CreateUserApiResponse = /** status 201 User created. */ User;
export type CreateUserApiArg = {
  createUserRequest: CreateUserRequest;
};
export type ReadUserApiResponse = /** status 200 User returned. */ User;
export type ReadUserApiArg = {
  id: number;
};
export type UpdateUserApiResponse = /** status 200 User updated. */ User;
export type UpdateUserApiArg = {
  id: number;
  updateUserRequest: UpdateUserRequest;
};
export type DeleteUserApiResponse = unknown;
export type DeleteUserApiArg = {
  id: number;
};
export type DeleteSelectedUsersApiResponse =
  /** status 200 Selected records processed. */ DeleteSelectedResponse;
export type DeleteSelectedUsersApiArg = {
  deleteSelectedRequest: DeleteSelectedRequest;
};
export type ListRolesApiResponse = /** status 200 Roles returned. */ Role[];
export type ListRolesApiArg = void;
export type CreateRoleApiResponse = /** status 201 Role created. */ Role;
export type CreateRoleApiArg = {
  createRoleRequest: CreateRoleRequest;
};
export type ReadRoleApiResponse = /** status 200 Role returned. */ Role;
export type ReadRoleApiArg = {
  id: number;
};
export type UpdateRoleApiResponse = /** status 200 Role updated. */ Role;
export type UpdateRoleApiArg = {
  id: number;
  updateRoleRequest: UpdateRoleRequest;
};
export type DeleteRoleApiResponse = unknown;
export type DeleteRoleApiArg = {
  id: number;
};
export type DeleteSelectedRolesApiResponse =
  /** status 200 Selected records processed. */ DeleteSelectedResponse;
export type DeleteSelectedRolesApiArg = {
  deleteSelectedRequest: DeleteSelectedRequest;
};
export type Role = {
  id: number;
  code: string;
  label: string;
  createdDate: string;
  lastModifiedDate: string;
};
export type User = {
  id: number;
  username: string;
  enabled: boolean;
  roles: Role[];
  createdDate: string;
  lastModifiedDate: string;
};
export type LoginResponse = {
  token: string;
  tokenType: string;
  expiresAt: string;
  user: User;
};
export type LoginRequest = {
  username: string;
  password: string;
};
export type CreateUserRequest = {
  username: string;
  password: string;
  enabled?: boolean;
  roles: string[];
};
export type UpdateUserRequest = {
  username: string;
  password?: string;
  enabled: boolean;
  roles: string[];
};
export type DeleteSelectedResponse = {
  deletedIds: number[];
  skippedIds: number[];
};
export type DeleteSelectedRequest = {
  ids: number[];
};
export type CreateRoleRequest = {
  code: string;
  label: string;
};
export type UpdateRoleRequest = {
  label: string;
};
export const {
  useLoginMutation,
  useMeQuery,
  useListUsersQuery,
  useCreateUserMutation,
  useReadUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useDeleteSelectedUsersMutation,
  useListRolesQuery,
  useCreateRoleMutation,
  useReadRoleQuery,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useDeleteSelectedRolesMutation,
} = injectedRtkApi;
