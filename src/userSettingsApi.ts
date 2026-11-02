import { emptySplitApi as api } from "./emptyApi";
export const addTagTypes = ["User settings"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      readMyUserSettings: build.query<
        ReadMyUserSettingsApiResponse,
        ReadMyUserSettingsApiArg
      >({
        query: () => ({ url: `/api/v1/settings/user/me` }),
        providesTags: ["User settings"],
      }),
      updateMyUserSettings: build.mutation<
        UpdateMyUserSettingsApiResponse,
        UpdateMyUserSettingsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/settings/user/me`,
          method: "PUT",
          body: queryArg.updateUserSettingsRequest,
        }),
        invalidatesTags: ["User settings"],
      }),
      readUserSettings: build.query<
        ReadUserSettingsApiResponse,
        ReadUserSettingsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/settings/user/users/${queryArg.userId}`,
        }),
        providesTags: ["User settings"],
      }),
      updateUserSettings: build.mutation<
        UpdateUserSettingsApiResponse,
        UpdateUserSettingsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/settings/user/users/${queryArg.userId}`,
          method: "PUT",
          body: queryArg.updateUserSettingsRequest,
        }),
        invalidatesTags: ["User settings"],
      }),
      readAnonymousUserSettings: build.query<
        ReadAnonymousUserSettingsApiResponse,
        ReadAnonymousUserSettingsApiArg
      >({
        query: () => ({ url: `/api/v1/settings/user/anonymous` }),
        providesTags: ["User settings"],
      }),
      updateAnonymousUserSettings: build.mutation<
        UpdateAnonymousUserSettingsApiResponse,
        UpdateAnonymousUserSettingsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/settings/user/anonymous`,
          method: "PUT",
          body: queryArg.updateUserSettingsRequest,
        }),
        invalidatesTags: ["User settings"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as userSettingsApi };
export type ReadMyUserSettingsApiResponse =
  /** status 200 User settings. */ UserSettings;
export type ReadMyUserSettingsApiArg = void;
export type UpdateMyUserSettingsApiResponse =
  /** status 200 User settings. */ UserSettings;
export type UpdateMyUserSettingsApiArg = {
  updateUserSettingsRequest: UpdateUserSettingsRequest;
};
export type ReadUserSettingsApiResponse =
  /** status 200 User settings. */ UserSettings;
export type ReadUserSettingsApiArg = {
  userId: number;
};
export type UpdateUserSettingsApiResponse =
  /** status 200 User settings. */ UserSettings;
export type UpdateUserSettingsApiArg = {
  userId: number;
  updateUserSettingsRequest: UpdateUserSettingsRequest;
};
export type ReadAnonymousUserSettingsApiResponse =
  /** status 200 User settings. */ UserSettings;
export type ReadAnonymousUserSettingsApiArg = void;
export type UpdateAnonymousUserSettingsApiResponse =
  /** status 200 User settings. */ UserSettings;
export type UpdateAnonymousUserSettingsApiArg = {
  updateUserSettingsRequest: UpdateUserSettingsRequest;
};
export type ViewMode = "light" | "dark" | "system";
export type UserSettings = {
  userId?: number | null;
  roleCode?: string | null;
  viewMode: ViewMode;
  createdDate?: string | null;
  lastModifiedDate?: string | null;
};
export type UpdateUserSettingsRequest = {
  viewMode: ViewMode;
};
export const {
  useReadMyUserSettingsQuery,
  useUpdateMyUserSettingsMutation,
  useReadUserSettingsQuery,
  useUpdateUserSettingsMutation,
  useReadAnonymousUserSettingsQuery,
  useUpdateAnonymousUserSettingsMutation,
} = injectedRtkApi;
