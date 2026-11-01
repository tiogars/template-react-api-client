import { describe, expect, it, vi } from 'vitest';

import { UserSettingsClient, UserSettingsError } from '../src/index.js';

const settings = {
  userId: 2,
  viewMode: 'dark',
  createdDate: '2026-08-01T10:00:00Z',
  lastModifiedDate: '2026-08-01T10:00:00Z',
};

describe('UserSettingsClient', () => {
  it('uses the user settings routes', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => new Response(JSON.stringify(settings), { status: 200 }));
    const client = new UserSettingsClient({
      baseUrl: 'https://api.example.test/',
      accessTokenProvider: () => 'existing-token',
      fetcher,
    });

    await expect(client.mine()).resolves.toEqual(settings);
    await expect(client.updateMine({ viewMode: 'light' })).resolves.toEqual(settings);
    await expect(client.user(2)).resolves.toEqual(settings);
    await expect(client.updateUser(2, { viewMode: 'dark' })).resolves.toEqual(settings);
    await expect(client.anonymous()).resolves.toEqual(settings);
    await expect(client.updateAnonymous({ viewMode: 'system' })).resolves.toEqual(settings);

    await expectRequest(fetcher, 1, '/api/v1/settings/user/me');
    await expectRequest(fetcher, 2, '/api/v1/settings/user/me', 'PUT', { viewMode: 'light' });
    await expectRequest(fetcher, 3, '/api/v1/settings/user/users/2');
    await expectRequest(fetcher, 4, '/api/v1/settings/user/users/2', 'PUT', { viewMode: 'dark' });
    await expectRequest(fetcher, 5, '/api/v1/settings/user/anonymous');
    await expectRequest(fetcher, 6, '/api/v1/settings/user/anonymous', 'PUT', { viewMode: 'system' });
  });

  it('exposes the HTTP status of failed requests', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 404 }));
    const client = new UserSettingsClient({ baseUrl: 'https://api.example.test/', fetcher });

    const error = await client.user(1).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(UserSettingsError);
    expect((error as UserSettingsError).status).toBe(404);
  });
});

async function expectRequest(
  fetcher: ReturnType<typeof vi.fn<typeof fetch>>,
  callNumber: number,
  path: string,
  method = 'GET',
  body?: object,
) {
  const request = fetcher.mock.calls[callNumber - 1]?.[0] as Request;
  expect(request.url).toBe(`https://api.example.test${path}`);
  expect(request.method).toBe(method);
  if (body) expect(await request.json()).toEqual(body);
}
