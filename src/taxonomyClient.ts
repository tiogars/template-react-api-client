import { configureStore } from '@reduxjs/toolkit';
import { emptySplitApi, configureTaskApi } from './emptyApi';
import { tagApi, type CreateTagRequest, type UpdateTagRequest } from './tagApi';
import {
  nomenclatureApi,
  type CreateNomenclatureRequest,
  type UpdateNomenclatureRequest,
} from './nomenclatureApi';
import type { TaskClientOptions } from './index';

function createStore(options?: TaskClientOptions) {
  if (options) configureTaskApi(options.baseUrl, options.accessTokenProvider, options.fetcher);
  return configureStore({
    reducer: { [emptySplitApi.reducerPath]: emptySplitApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(emptySplitApi.middleware),
  });
}

export class TagClient {
  private readonly store;
  constructor(options?: TaskClientOptions) {
    this.store = createStore(options);
  }
  findAll() {
    return this.store
      .dispatch(
        tagApi.endpoints.listTag.initiate(undefined, { subscribe: false, forceRefetch: true }),
      )
      .unwrap();
  }
  findById(id: number) {
    return this.store
      .dispatch(tagApi.endpoints.readTag.initiate({ id }, { subscribe: false, forceRefetch: true }))
      .unwrap();
  }
  create(request: CreateTagRequest) {
    return this.store
      .dispatch(tagApi.endpoints.createTag.initiate({ createTagRequest: request }))
      .unwrap();
  }
  update(id: number, request: UpdateTagRequest) {
    return this.store
      .dispatch(tagApi.endpoints.updateTag.initiate({ id, updateTagRequest: request }))
      .unwrap();
  }
  async delete(id: number): Promise<void> {
    await this.store.dispatch(tagApi.endpoints.deleteTag.initiate({ id })).unwrap();
  }
}

export class NomenclatureClient {
  private readonly store;
  constructor(options?: TaskClientOptions) {
    this.store = createStore(options);
  }
  findAll() {
    return this.store
      .dispatch(
        nomenclatureApi.endpoints.listNomenclature.initiate(undefined, {
          subscribe: false,
          forceRefetch: true,
        }),
      )
      .unwrap();
  }
  findById(id: number) {
    return this.store
      .dispatch(
        nomenclatureApi.endpoints.readNomenclature.initiate(
          { id },
          { subscribe: false, forceRefetch: true },
        ),
      )
      .unwrap();
  }
  create(request: CreateNomenclatureRequest) {
    return this.store
      .dispatch(
        nomenclatureApi.endpoints.createNomenclature.initiate({
          createNomenclatureRequest: request,
        }),
      )
      .unwrap();
  }
  update(id: number, request: UpdateNomenclatureRequest) {
    return this.store
      .dispatch(
        nomenclatureApi.endpoints.updateNomenclature.initiate({
          id,
          updateNomenclatureRequest: request,
        }),
      )
      .unwrap();
  }
  async delete(id: number): Promise<void> {
    await this.store
      .dispatch(nomenclatureApi.endpoints.deleteNomenclature.initiate({ id }))
      .unwrap();
  }
}

export const tagClient = new TagClient();
export const nomenclatureClient = new NomenclatureClient();
