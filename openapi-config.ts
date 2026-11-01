import type { ConfigFile } from '@rtk-query/codegen-openapi';

const config: ConfigFile = {
  schemaFile: './openapi.yaml',
  apiFile: './src/emptyApi.ts',
  apiImport: 'emptySplitApi',
  outputFiles: {
    // auth
    './src/authApi.ts': {
      exportName: 'authApi',
      filterEndpoints: [
        'login',
        'me',
        'createUser',
        'deleteUser',
        'deleteSelectedUsers',
        'readUser',
        'listUsers',
        'updateUser',
        'createRole',
        'deleteRole',
        'deleteSelectedRoles',
        'readRole',
        'listRoles',
        'updateRole',
      ],
    },
    // task
    './src/taskApi.ts': {
      exportName: 'taskApi',
      filterEndpoints: [
        'createTask',
        'deleteTask',
        'deleteSelectedTask',
        'importJsonTask',
        'importCsvTask',
        'exportJsonTask',
        'exportCsvTask',
        'readTask',
        'seedTask',
        'listTask',
        'updateTask',
      ],
    },
    './src/tagApi.ts': {
      exportName: 'tagApi',
      filterEndpoints: ['listTag', 'readTag', 'createTag', 'updateTag', 'deleteTag'],
    },
    './src/nomenclatureApi.ts': {
      exportName: 'nomenclatureApi',
      filterEndpoints: [
        'listNomenclature',
        'readNomenclature',
        'createNomenclature',
        'updateNomenclature',
        'deleteNomenclature',
      ],
    },
    // settings/user
    './src/userSettingsApi.ts': {
      exportName: 'userSettingsApi',
      filterEndpoints: [
        'readMyUserSettings',
        'updateMyUserSettings',
        'readUserSettings',
        'updateUserSettings',
        'readAnonymousUserSettings',
        'updateAnonymousUserSettings',
      ],
    },
  },
  hooks: true,
  tag: true,
};

export default config;
