import { emptySplitApi as api } from './emptyApi';
export const addTagTypes = ['Tags'] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      listTag: build.query<ListTagApiResponse, ListTagApiArg>({
        query: () => ({ url: `/api/v1/tag` }),
        providesTags: ['Tags'],
      }),
      createTag: build.mutation<CreateTagApiResponse, CreateTagApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/tag`,
          method: 'POST',
          body: queryArg.createTagRequest,
        }),
        invalidatesTags: ['Tags'],
      }),
      readTag: build.query<ReadTagApiResponse, ReadTagApiArg>({
        query: (queryArg) => ({ url: `/api/v1/tag/${queryArg.id}` }),
        providesTags: ['Tags'],
      }),
      updateTag: build.mutation<UpdateTagApiResponse, UpdateTagApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/tag/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.updateTagRequest,
        }),
        invalidatesTags: ['Tags'],
      }),
      deleteTag: build.mutation<DeleteTagApiResponse, DeleteTagApiArg>({
        query: (queryArg) => ({ url: `/api/v1/tag/${queryArg.id}`, method: 'DELETE' }),
        invalidatesTags: ['Tags'],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as tagApi };
export type ListTagApiResponse = /** status 200 Tags returned. */ TagRead[];
export type ListTagApiArg = void;
export type CreateTagApiResponse = /** status 201 Tag created. */ TagRead;
export type CreateTagApiArg = {
  createTagRequest: CreateTagRequest;
};
export type ReadTagApiResponse = /** status 200 Tag returned. */ TagRead;
export type ReadTagApiArg = {
  id: number;
};
export type UpdateTagApiResponse = /** status 200 Tag updated. */ TagRead;
export type UpdateTagApiArg = {
  id: number;
  updateTagRequest: UpdateTagRequest;
};
export type DeleteTagApiResponse = unknown;
export type DeleteTagApiArg = {
  id: number;
};
export type BusinessFields = {
  /** Unique immutable business code. */
  code: string;
  label: string;
  description?: string | null;
};
export type Audit = {
  id: number;
  createdDate: string;
  lastModifiedDate: string;
  createdBy: string;
  lastModifiedBy: string;
};
export type TagRead = BusinessFields & Audit;
export type CreateTagRequest = BusinessFields;
export type UpdateTagRequest = {
  label: string;
  description?: string | null;
};
export const {
  useListTagQuery,
  useCreateTagMutation,
  useReadTagQuery,
  useUpdateTagMutation,
  useDeleteTagMutation,
} = injectedRtkApi;
