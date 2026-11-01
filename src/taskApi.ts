import { emptySplitApi as api } from './emptyApi';
export const addTagTypes = ['Tasks'] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      listTask: build.query<ListTaskApiResponse, ListTaskApiArg>({
        query: () => ({ url: `/api/v1/task` }),
        providesTags: ['Tasks'],
      }),
      createTask: build.mutation<CreateTaskApiResponse, CreateTaskApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/task`,
          method: 'POST',
          body: queryArg.createTaskRequest,
        }),
        invalidatesTags: ['Tasks'],
      }),
      readTask: build.query<ReadTaskApiResponse, ReadTaskApiArg>({
        query: (queryArg) => ({ url: `/api/v1/task/${queryArg.id}` }),
        providesTags: ['Tasks'],
      }),
      updateTask: build.mutation<UpdateTaskApiResponse, UpdateTaskApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/task/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.updateTaskRequest,
        }),
        invalidatesTags: ['Tasks'],
      }),
      deleteTask: build.mutation<DeleteTaskApiResponse, DeleteTaskApiArg>({
        query: (queryArg) => ({ url: `/api/v1/task/${queryArg.id}`, method: 'DELETE' }),
        invalidatesTags: ['Tasks'],
      }),
      deleteSelectedTask: build.mutation<DeleteSelectedTaskApiResponse, DeleteSelectedTaskApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/task/delete-selected`,
          method: 'POST',
          body: queryArg.deleteSelectedRequest,
        }),
        invalidatesTags: ['Tasks'],
      }),
      seedTask: build.mutation<SeedTaskApiResponse, SeedTaskApiArg>({
        query: (queryArg) => ({ url: `/api/v1/task/seed`, method: 'POST', body: queryArg.body }),
        invalidatesTags: ['Tasks'],
      }),
      importJsonTask: build.mutation<ImportJsonTaskApiResponse, ImportJsonTaskApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/task/import.json`,
          method: 'POST',
          body: queryArg.body,
        }),
        invalidatesTags: ['Tasks'],
      }),
      importCsvTask: build.mutation<ImportCsvTaskApiResponse, ImportCsvTaskApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/task/import.csv`,
          method: 'POST',
          body: queryArg.body,
        }),
        invalidatesTags: ['Tasks'],
      }),
      exportJsonTask: build.query<ExportJsonTaskApiResponse, ExportJsonTaskApiArg>({
        query: () => ({ url: `/api/v1/task/export.json` }),
        providesTags: ['Tasks'],
      }),
      exportCsvTask: build.query<ExportCsvTaskApiResponse, ExportCsvTaskApiArg>({
        query: () => ({ url: `/api/v1/task/export.csv` }),
        providesTags: ['Tasks'],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as taskApi };
export type ListTaskApiResponse = /** status 200 Tasks returned. */ TaskRead[];
export type ListTaskApiArg = void;
export type CreateTaskApiResponse = /** status 201 Task created. */ TaskRead;
export type CreateTaskApiArg = {
  createTaskRequest: CreateTaskRequest;
};
export type ReadTaskApiResponse = /** status 200 Task returned. */ TaskRead;
export type ReadTaskApiArg = {
  id: number;
};
export type UpdateTaskApiResponse = /** status 200 Task updated. */ TaskRead;
export type UpdateTaskApiArg = {
  id: number;
  updateTaskRequest: UpdateTaskRequest;
};
export type DeleteTaskApiResponse = unknown;
export type DeleteTaskApiArg = {
  id: number;
};
export type DeleteSelectedTaskApiResponse =
  /** status 200 Selected records processed. */ DeleteSelectedResponse;
export type DeleteSelectedTaskApiArg = {
  deleteSelectedRequest: DeleteSelectedRequest;
};
export type SeedTaskApiResponse = /** status 201 Tasks imported. */ TaskRead[];
export type SeedTaskApiArg = {
  body: CreateTaskRequest[];
};
export type ImportJsonTaskApiResponse = /** status 201 Tasks imported. */ TaskRead[];
export type ImportJsonTaskApiArg = {
  body: CreateTaskRequest[];
};
export type ImportCsvTaskApiResponse = /** status 201 Tasks imported. */ TaskRead[];
export type ImportCsvTaskApiArg = {
  body: string;
};
export type ExportJsonTaskApiResponse = /** status 200 Tasks exported. */ TaskRead[];
export type ExportJsonTaskApiArg = void;
export type ExportCsvTaskApiResponse = unknown;
export type ExportCsvTaskApiArg = void;
export type BusinessFields = {
  /** Unique immutable business code. */
  code: string;
  label: string;
  description?: string | null;
};
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type TaskFields = {
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  /** Free text assignee, not a user reference. */
  assignedTo?: string | null;
  tagIds?: number[];
  nomenclatureId?: number | null;
};
export type Audit = {
  id: number;
  createdDate: string;
  lastModifiedDate: string;
  createdBy: string;
  lastModifiedBy: string;
};
export type TaskRead = BusinessFields & TaskFields & Audit;
export type CreateTaskRequest = BusinessFields & TaskFields;
export type UpdateTagRequest = {
  label: string;
  description?: string | null;
};
export type UpdateTaskRequest = UpdateTagRequest & TaskFields;
export type DeleteSelectedResponse = {
  deletedIds: number[];
  skippedIds: number[];
};
export type DeleteSelectedRequest = {
  ids: number[];
};
export const {
  useListTaskQuery,
  useCreateTaskMutation,
  useReadTaskQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useDeleteSelectedTaskMutation,
  useSeedTaskMutation,
  useImportJsonTaskMutation,
  useImportCsvTaskMutation,
  useExportJsonTaskQuery,
  useExportCsvTaskQuery,
} = injectedRtkApi;
