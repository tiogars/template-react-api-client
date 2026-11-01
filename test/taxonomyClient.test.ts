import { describe, expect, it, vi } from 'vitest';
import { TagClient, NomenclatureClient } from '../src/index';

const record = {
  id: 4,
  code: 'OPS',
  label: 'Operations',
  description: 'Operational work',
  createdDate: '2026-10-01T00:00:00Z',
  lastModifiedDate: '2026-10-02T00:00:00Z',
  createdBy: 'admin',
  lastModifiedBy: 'editor',
};

describe('taxonomy clients', () => {
  it.each(['tag', 'nomenclature'] as const)(
    'supports authenticated %s CRUD including hierarchy data',
    async (kind) => {
      const model = kind === 'tag' ? record : { ...record, parentId: 1 };
      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(new Response(JSON.stringify([model])))
        .mockResolvedValueOnce(new Response(JSON.stringify(model)))
        .mockResolvedValueOnce(new Response(JSON.stringify(model), { status: 201 }))
        .mockResolvedValueOnce(new Response(JSON.stringify(model)))
        .mockResolvedValueOnce(new Response(null, { status: 204 }));
      const options = {
        baseUrl: 'https://api.example.test',
        fetcher,
        accessTokenProvider: () => 'taxonomy-token',
      };
      const client = kind === 'tag' ? new TagClient(options) : new NomenclatureClient(options);
      expect(await client.findAll()).toEqual([model]);
      expect(await client.findById(4)).toEqual(model);
      const fields = {
        label: record.label,
        description: record.description,
        ...(kind === 'nomenclature' ? { parentId: 1 } : {}),
      };
      expect(await client.create({ code: 'OPS', ...fields })).toEqual(model);
      expect(await client.update(4, fields)).toEqual(model);
      await client.delete(4);
      expect(fetcher.mock.calls.map(([request]) => (request as Request).url)).toEqual([
        `https://api.example.test/api/v1/${kind}`,
        `https://api.example.test/api/v1/${kind}/4`,
        `https://api.example.test/api/v1/${kind}`,
        `https://api.example.test/api/v1/${kind}/4`,
        `https://api.example.test/api/v1/${kind}/4`,
      ]);
      const requests = fetcher.mock.calls.map(([request]) => request as Request);
      expect(requests.map((request) => request.method)).toEqual([
        'GET',
        'GET',
        'POST',
        'PUT',
        'DELETE',
      ]);
      expect(await requests[2].json()).toEqual({ code: 'OPS', ...fields });
      expect(await requests[3].json()).toEqual(fields);
      for (const request of requests)
        expect(request.headers.get('Authorization')).toContain('taxonomy-token');
    },
  );

  it('surfaces referenced-delete conflicts', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ message: 'Referenced' }), { status: 409 }));
    const client = new TagClient({ baseUrl: 'https://api.example.test', fetcher });
    await expect(client.delete(4)).rejects.toMatchObject({ status: 409 });
  });
});
