import { configureStore } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { AuthClient } from './authClient';
import { UserSettingsClient } from './userSettingsClient';
import {
  taskApi,
  type CreateTaskRequest as GeneratedCreateTaskRequest,
  type DeleteSelectedResponse,
  type TaskRead,
  type UpdateTaskRequest as GeneratedUpdateTaskRequest,
} from './taskApi';
import { configureTaskApi, emptySplitApi, requestTaskPdf } from './emptyApi';
export type TaskStatus = NonNullable<GeneratedCreateTaskRequest['status']>;
export type TaskPriority = NonNullable<GeneratedCreateTaskRequest['priority']>;
export type TaskFields = Pick<
  GeneratedCreateTaskRequest,
  'status' | 'priority' | 'dueDate' | 'assignedTo' | 'tagIds' | 'nomenclatureId'
>;

export type Task = {
  id: number;
  code: string;
  label: string;
  description: string | null;
  createdDate: string;
  lastModifiedDate: string;
  createdBy: string;
  lastModifiedBy: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assignedTo: string | null;
  tagIds: number[];
  nomenclatureId: number | null;
};

export type CreateTaskRequest = TaskFields & {
  code: string;
  label: string;
  description: string | null;
};

export type UpdateTaskRequest = TaskFields & {
  label: string;
  description: string | null;
};

export type TaskClientOptions = {
  baseUrl: string;
  fetcher?: typeof fetch;
  accessTokenProvider?: () => string | null;
};

export class TaskError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export class TaskClient {
  private readonly store = configureStore({
    reducer: {
      [emptySplitApi.reducerPath]: emptySplitApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(emptySplitApi.middleware),
  });

  constructor(options: TaskClientOptions) {
    configureTaskApi(options.baseUrl, options.accessTokenProvider, options.fetcher);
  }

  async findAll(): Promise<Task[]> {
    const templates = await this.unwrapGenerated(
      this.store.dispatch(
        taskApi.endpoints.listTask.initiate(undefined, { subscribe: false, forceRefetch: true }),
      ),
    );
    return templates.map(toTask);
  }

  async findById(id: number): Promise<Task> {
    const template = await this.unwrapGenerated(
      this.store.dispatch(
        taskApi.endpoints.readTask.initiate({ id }, { subscribe: false, forceRefetch: true }),
      ),
    );
    return toTask(template);
  }

  async create(request: CreateTaskRequest): Promise<Task> {
    const template = await this.unwrapGenerated(
      this.store.dispatch(
        taskApi.endpoints.createTask.initiate({ createTaskRequest: toCreateRequest(request) }),
      ),
    );
    return toTask(template);
  }

  async update(id: number, request: UpdateTaskRequest): Promise<Task> {
    const template = await this.unwrapGenerated(
      this.store.dispatch(
        taskApi.endpoints.updateTask.initiate({ id, updateTaskRequest: toUpdateRequest(request) }),
      ),
    );
    return toTask(template);
  }

  async delete(id: number): Promise<void> {
    await this.unwrapGenerated(this.store.dispatch(taskApi.endpoints.deleteTask.initiate({ id })));
  }

  async deleteSelected(ids: number[]): Promise<DeleteSelectedResponse> {
    return this.unwrapGenerated(
      this.store.dispatch(
        taskApi.endpoints.deleteSelectedTask.initiate({ deleteSelectedRequest: { ids } }),
      ),
    );
  }

  async seed(requests: CreateTaskRequest[]): Promise<Task[]> {
    const templates = await this.unwrapGenerated(
      this.store.dispatch(
        taskApi.endpoints.seedTask.initiate({ body: requests.map(toCreateRequest) }),
      ),
    );
    return templates.map(toTask);
  }

  async importJson(requests: CreateTaskRequest[]): Promise<Task[]> {
    const templates = await this.unwrapGenerated(
      this.store.dispatch(
        taskApi.endpoints.importJsonTask.initiate({ body: requests.map(toCreateRequest) }),
      ),
    );
    return templates.map(toTask);
  }

  async exportJson(): Promise<Task[]> {
    const templates = await this.unwrapGenerated(
      this.store.dispatch(
        taskApi.endpoints.exportJsonTask.initiate(undefined, {
          subscribe: false,
          forceRefetch: true,
        }),
      ),
    );
    return templates.map(toTask);
  }

  async importCsv(csv: string): Promise<Task[]> {
    const templates = await this.unwrapGenerated(
      this.store.dispatch(taskApi.endpoints.importCsvTask.initiate({ body: csv })),
    );
    return templates.map(toTask);
  }

  async exportCsv(): Promise<string> {
    return this.unwrapGenerated(
      this.store.dispatch(
        taskApi.endpoints.exportCsvTask.initiate(undefined, {
          subscribe: false,
          forceRefetch: true,
        }),
      ),
    ) as Promise<string>;
  }

  print(id: number): Promise<Blob> {
    return this.printPdf(`/api/v1/task/${id}/print.pdf`);
  }

  printAll(): Promise<Blob> {
    return this.printPdf('/api/v1/task/print.pdf');
  }

  printSelected(ids: number[]): Promise<Blob> {
    if (
      ids.length === 0 ||
      ids.length > 1000 ||
      ids.some((id) => !Number.isSafeInteger(id) || id <= 0)
    ) {
      return Promise.reject(new Error('Select between 1 and 1000 Tasks to print.'));
    }
    return this.printPdf('/api/v1/task/print-selected.pdf', ids);
  }

  private async printPdf(path: string, ids?: number[]): Promise<Blob> {
    const response = await requestTaskPdf(path, ids);
    if (!response.ok) {
      const message =
        response.status === 404
          ? 'One or more Tasks no longer exist. Refresh the list before printing.'
          : response.status === 422
            ? 'A Task contains characters unsupported by the PDF font.'
            : `PDF request failed with HTTP ${response.status}`;
      throw new TaskError(message, response.status);
    }
    if (
      response.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/pdf'
    ) {
      throw new Error('The server did not return a PDF document.');
    }
    const pdf = await response.blob();
    if (pdf.size === 0) throw new Error('The server returned an empty PDF document.');
    return pdf;
  }

  private async unwrapGenerated<T>(request: { unwrap(): Promise<T> }): Promise<T> {
    try {
      return await request.unwrap();
    } catch (error) {
      if (isFetchBaseQueryError(error)) {
        throw new TaskError(`API request failed with HTTP ${error.status}`, Number(error.status));
      }
      throw error;
    }
  }
}

export function createTaskClient(
  baseUrl: string,
  accessTokenProvider?: () => string | null,
): TaskClient {
  return new TaskClient({ baseUrl, accessTokenProvider });
}

export const taskClient = createTaskClient('http://localhost:8080');

export const authClient = new AuthClient({ baseUrl: 'http://localhost:8080' });

export const userSettingsClient = new UserSettingsClient({ baseUrl: 'http://localhost:8080' });

const toTask = (template: TaskRead): Task => ({
  ...template,
  description: template.description ?? null,
  status: template.status ?? 'TODO',
  priority: template.priority ?? 'NORMAL',
  dueDate: template.dueDate ?? null,
  assignedTo: template.assignedTo ?? null,
  tagIds: template.tagIds ?? [],
  nomenclatureId: template.nomenclatureId ?? null,
});

const toCreateRequest = (request: CreateTaskRequest): GeneratedCreateTaskRequest => ({
  ...request,
  description: request.description ?? undefined,
});

const toUpdateRequest = (request: UpdateTaskRequest): GeneratedUpdateTaskRequest => ({
  ...request,
  description: request.description ?? undefined,
});

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error;
}

export { configureTaskApi, emptySplitApi } from './emptyApi';
export { AuthClient, AuthError } from './authClient';
export { authApi } from './authApi';
export { taskApi } from './taskApi';
export type {
  CreateRoleRequest,
  CreateUserRequest,
  LoginRequest,
  LoginResponse,
  Role,
  UpdateRoleRequest,
  UpdateUserRequest,
  User as UserAccount,
} from './authApi';
export type { DeleteSelectedRequest, DeleteSelectedResponse, TaskRead } from './taskApi';
export { UserSettingsClient, UserSettingsError } from './userSettingsClient';
export { userSettingsApi } from './userSettingsApi';
export type { UpdateUserSettingsRequest, UserSettings, ViewMode } from './userSettingsApi';
export {
  useReadTaskQuery,
  useListTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useDeleteSelectedTaskMutation,
  useSeedTaskMutation,
  useImportJsonTaskMutation,
  useImportCsvTaskMutation,
  useExportJsonTaskQuery,
  useExportCsvTaskQuery,
} from './taskApi';
export {
  tagApi,
  useListTagQuery,
  useReadTagQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} from './tagApi';
export type { TagRead, CreateTagRequest, UpdateTagRequest } from './tagApi';
export type { TagRead as Tag } from './tagApi';
export {
  nomenclatureApi,
  useListNomenclatureQuery,
  useReadNomenclatureQuery,
  useCreateNomenclatureMutation,
  useUpdateNomenclatureMutation,
  useDeleteNomenclatureMutation,
} from './nomenclatureApi';
export type {
  NomenclatureRead,
  CreateNomenclatureRequest,
  UpdateNomenclatureRequest,
} from './nomenclatureApi';
export type { NomenclatureRead as Nomenclature } from './nomenclatureApi';
export { TagClient, NomenclatureClient, tagClient, nomenclatureClient } from './taxonomyClient';
