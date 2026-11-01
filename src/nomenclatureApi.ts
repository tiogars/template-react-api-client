import { emptySplitApi as api } from './emptyApi';
export const addTagTypes = ['Nomenclatures'] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      listNomenclature: build.query<ListNomenclatureApiResponse, ListNomenclatureApiArg>({
        query: () => ({ url: `/api/v1/nomenclature` }),
        providesTags: ['Nomenclatures'],
      }),
      createNomenclature: build.mutation<CreateNomenclatureApiResponse, CreateNomenclatureApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/nomenclature`,
          method: 'POST',
          body: queryArg.createNomenclatureRequest,
        }),
        invalidatesTags: ['Nomenclatures'],
      }),
      readNomenclature: build.query<ReadNomenclatureApiResponse, ReadNomenclatureApiArg>({
        query: (queryArg) => ({ url: `/api/v1/nomenclature/${queryArg.id}` }),
        providesTags: ['Nomenclatures'],
      }),
      updateNomenclature: build.mutation<UpdateNomenclatureApiResponse, UpdateNomenclatureApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/nomenclature/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.updateNomenclatureRequest,
        }),
        invalidatesTags: ['Nomenclatures'],
      }),
      deleteNomenclature: build.mutation<DeleteNomenclatureApiResponse, DeleteNomenclatureApiArg>({
        query: (queryArg) => ({ url: `/api/v1/nomenclature/${queryArg.id}`, method: 'DELETE' }),
        invalidatesTags: ['Nomenclatures'],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as nomenclatureApi };
export type ListNomenclatureApiResponse =
  /** status 200 Nomenclatures returned. */ NomenclatureRead[];
export type ListNomenclatureApiArg = void;
export type CreateNomenclatureApiResponse =
  /** status 201 Nomenclature created. */ NomenclatureRead;
export type CreateNomenclatureApiArg = {
  createNomenclatureRequest: CreateNomenclatureRequest;
};
export type ReadNomenclatureApiResponse = /** status 200 Nomenclature returned. */ NomenclatureRead;
export type ReadNomenclatureApiArg = {
  id: number;
};
export type UpdateNomenclatureApiResponse =
  /** status 200 Nomenclature updated. */ NomenclatureRead;
export type UpdateNomenclatureApiArg = {
  id: number;
  updateNomenclatureRequest: UpdateNomenclatureRequest;
};
export type DeleteNomenclatureApiResponse = unknown;
export type DeleteNomenclatureApiArg = {
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
export type NomenclatureParent = {
  parentId?: number | null;
};
export type NomenclatureRead = TagRead & NomenclatureParent;
export type CreateTagRequest = BusinessFields;
export type CreateNomenclatureRequest = CreateTagRequest & NomenclatureParent;
export type UpdateTagRequest = {
  label: string;
  description?: string | null;
};
export type UpdateNomenclatureRequest = UpdateTagRequest & NomenclatureParent;
export const {
  useListNomenclatureQuery,
  useCreateNomenclatureMutation,
  useReadNomenclatureQuery,
  useUpdateNomenclatureMutation,
  useDeleteNomenclatureMutation,
} = injectedRtkApi;
