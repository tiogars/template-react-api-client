import { describe, expect, it, vi } from 'vitest';

import { AuthClient } from '../src/index.js';

const role = {
  id: 1,
  code: 'ADMIN',
  label: 'Administrator',
  createdDate: '2026-08-01T10:00:00Z',
  lastModifiedDate: '2026-08-01T10:00:00Z',
};

const user = {
  id: 1,
  username: 'admin',
  enabled: true,
  roles: [role],
  createdDate: '2026-08-01T10:00:00Z',
  lastModifiedDate: '2026-08-01T10:00:00Z',
};

describe('AuthClient', () => {
  it('uses the generated authentication, user, and role routes', async () => {
    const loginResponse = {
      token: 'new-token',
      tokenType: 'Bearer',
      expiresAt: '2026-09-01T11:00:00Z',
      user,
    };
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify(loginResponse), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([user]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(user), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([role]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(role), { status: 201 }));
    const client = new AuthClient({
      baseUrl: 'https://api.example.test/',
      accessTokenProvider: () => 'existing-token',
      fetcher,
    });

    await expect(client.login('admin', 'secret')).resolves.toEqual(loginResponse);
    await expect(client.users()).resolves.toEqual([user]);
    await expect(
      client.createUser({ username: 'editor', password: 'secret', enabled: true, roles: ['USER'] }),
    ).resolves.toEqual(user);
    await expect(client.roles()).resolves.toEqual([role]);
    await expect(client.createRole({ code: 'EDITOR', label: 'Editor' })).resolves.toEqual(role);

    await expectRequest(fetcher, 1, '/api/v1/auth/login', 'POST', { username: 'admin', password: 'secret' }, false);
    await expectRequest(fetcher, 2, '/api/v1/auth/users');
    await expectRequest(fetcher, 3, '/api/v1/auth/users', 'POST', {
      username: 'editor',
      password: 'secret',
      enabled: true,
      roles: ['USER'],
    });
    await expectRequest(fetcher, 4, '/api/v1/auth/roles');
    await expectRequest(fetcher, 5, '/api/v1/auth/roles', 'POST', { code: 'EDITOR', label: 'Editor' });
  });

  it('uses the delete-selected routes for users and roles', async () => {
    const result = { deletedIds: [2, 3], skippedIds: [1] };
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify(result), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(result), { status: 200 }));
    const client = new AuthClient({
      baseUrl: 'https://api.example.test/',
      accessTokenProvider: () => 'existing-token',
      fetcher,
    });

    await expect(client.deleteUsers([1, 2, 3])).resolves.toEqual(result);
    await expect(client.deleteRoles([1, 2, 3])).resolves.toEqual(result);

    await expectRequest(fetcher, 1, '/api/v1/auth/users/delete-selected', 'POST', { ids: [1, 2, 3] });
    await expectRequest(fetcher, 2, '/api/v1/auth/roles/delete-selected', 'POST', { ids: [1, 2, 3] });
  });
});

async function expectRequest(
  fetcher: ReturnType<typeof vi.fn<typeof fetch>>,
  callNumber: number,
  path: string,
  method = 'GET',
  body?: object,
  authenticated = true,
) {
  const request = fetcher.mock.calls[callNumber - 1]?.[0] as Request;
  expect(request.url).toBe(`https://api.example.test${path}`);
  expect(request.method).toBe(method);
  expect(request.headers.get('Authorization')).toBe(authenticated ? 'Bearer existing-token' : null);
  if (body) expect(await request.json()).toEqual(body);
}