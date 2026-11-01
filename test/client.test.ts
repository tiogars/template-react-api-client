import { describe, expect, it, vi } from 'vitest';

import { configureTaskApi, TaskClient, TaskError } from '../src/index.js';

const task = {
  id: 42,
  code: 'CUSTOMER',
  label: 'Customer',
  description: null,
  createdDate: '2026-08-29T12:00:00Z',
  lastModifiedDate: '2026-08-30T12:00:00Z',
  createdBy: 'creator',
  lastModifiedBy: 'editor',
  status: 'TODO',
  priority: 'NORMAL',
  dueDate: null,
  assignedTo: null,
  tagIds: [],
  nomenclatureId: null,
};

describe('TaskClient', () => {
  it('defaults legacy records and sends all task fields on create and update', async () => {
    const legacy = { ...task } as Record<string, unknown>;
    for (const key of ['status', 'priority', 'dueDate', 'assignedTo', 'tagIds', 'nomenclatureId'])
      delete legacy[key];
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => new Response(JSON.stringify(legacy)));
    const client = new TaskClient({ baseUrl: 'https://api.example.test', fetcher });
    expect(await client.findById(42)).toEqual(task);
    const fields = {
      label: 'Ship release',
      description: 'Verify deployment',
      status: 'IN_PROGRESS' as const,
      priority: 'URGENT' as const,
      dueDate: '2026-12-01',
      assignedTo: 'alice',
      tagIds: [2, 3],
      nomenclatureId: 9,
    };
    await client.create({ code: 'RELEASE', ...fields });
    await client.update(42, fields);
    await expectRequest(
      fetcher,
      2,
      'https://api.example.test/api/v1/task',
      'POST',
      JSON.stringify({ code: 'RELEASE', ...fields }),
    );
    await expectRequest(
      fetcher,
      3,
      'https://api.example.test/api/v1/task/42',
      'PUT',
      JSON.stringify(fields),
    );
  });
  it('uses the Task CRUD routes and request bodies', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify([task]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(task), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(task), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(task), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const client = new TaskClient({ baseUrl: 'https://api.example.test/', fetcher });

    await expect(client.findAll()).resolves.toEqual([task]);
    await expect(client.findById(42)).resolves.toEqual(task);
    await expect(
      client.create({ code: 'CUSTOMER', label: 'Customer', description: null }),
    ).resolves.toEqual(task);
    await expect(
      client.update(42, { label: 'Customer', description: 'Updated customer template' }),
    ).resolves.toEqual(task);
    await expect(client.delete(42)).resolves.toBeUndefined();

    await expectRequest(fetcher, 1, 'https://api.example.test/api/v1/task');
    await expectRequest(fetcher, 2, 'https://api.example.test/api/v1/task/42');
    await expectRequest(
      fetcher,
      3,
      'https://api.example.test/api/v1/task',
      'POST',
      JSON.stringify({ code: 'CUSTOMER', label: 'Customer' }),
    );
    await expectRequest(
      fetcher,
      4,
      'https://api.example.test/api/v1/task/42',
      'PUT',
      JSON.stringify({ label: 'Customer', description: 'Updated customer template' }),
    );
    await expectRequest(fetcher, 5, 'https://api.example.test/api/v1/task/42', 'DELETE');
  });

  it('roundtrips extra fields through seed and JSON imports and exports', async () => {
    const request = {
      code: 'RELEASE',
      label: 'Ship release',
      description: 'Deployment task',
      status: 'IN_PROGRESS' as const,
      priority: 'URGENT' as const,
      dueDate: '2026-12-01',
      assignedTo: 'external-contractor',
      tagIds: [2, 3],
      nomenclatureId: 9,
    };
    const record = { ...task, ...request };
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => new Response(JSON.stringify([record])));
    const client = new TaskClient({ baseUrl: 'https://api.example.test', fetcher });

    await expect(client.seed([request])).resolves.toEqual([record]);
    await expect(client.importJson([request])).resolves.toEqual([record]);
    await expect(client.exportJson()).resolves.toEqual([record]);

    await expectRequest(
      fetcher,
      1,
      'https://api.example.test/api/v1/task/seed',
      'POST',
      JSON.stringify([request]),
    );
    await expectRequest(
      fetcher,
      2,
      'https://api.example.test/api/v1/task/import.json',
      'POST',
      JSON.stringify([request]),
    );
    await expectRequest(fetcher, 3, 'https://api.example.test/api/v1/task/export.json');
  });

  it('uses the delete-selected route', async () => {
    const result = { deletedIds: [42], skippedIds: [99] };
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify(result), { status: 200 }));
    const client = new TaskClient({ baseUrl: 'https://api.example.test/', fetcher });

    await expect(client.deleteSelected([42, 99])).resolves.toEqual(result);

    await expectRequest(
      fetcher,
      1,
      'https://api.example.test/api/v1/task/delete-selected',
      'POST',
      JSON.stringify({ ids: [42, 99] }),
    );
  });

  it('uses the seed, import, and export routes', async () => {
    const templates = [task];
    const requests = [{ code: 'CUSTOMER', label: 'Customer', description: null }];
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify(templates), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(templates), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(templates), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(templates), { status: 200 }))
      .mockResolvedValueOnce(new Response('code,label,description\n', { status: 200 }));
    const client = new TaskClient({ baseUrl: 'https://api.example.test/', fetcher });

    await expect(client.seed(requests)).resolves.toEqual(templates);
    await expect(client.importJson(requests)).resolves.toEqual(templates);
    await expect(client.importCsv('code,label,description\n')).resolves.toEqual(templates);
    await expect(client.exportJson()).resolves.toEqual(templates);
    await expect(client.exportCsv()).resolves.toBe('code,label,description\n');

    await expectRequest(
      fetcher,
      1,
      'https://api.example.test/api/v1/task/seed',
      'POST',
      JSON.stringify([{ code: 'CUSTOMER', label: 'Customer' }]),
    );
    await expectRequest(
      fetcher,
      2,
      'https://api.example.test/api/v1/task/import.json',
      'POST',
      JSON.stringify([{ code: 'CUSTOMER', label: 'Customer' }]),
    );
    await expectRequest(
      fetcher,
      3,
      'https://api.example.test/api/v1/task/import.csv',
      'POST',
      'code,label,description\n',
      'text/csv',
    );
    await expectRequest(fetcher, 4, 'https://api.example.test/api/v1/task/export.json');
    await expectRequest(fetcher, 5, 'https://api.example.test/api/v1/task/export.csv');
  });

  it('throws TaskError for HTTP failures', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 404 }));
    const client = new TaskClient({ baseUrl: 'https://api.example.test', fetcher });

    await expect(client.findById(999)).rejects.toEqual(
      expect.objectContaining<Partial<TaskError>>({ status: 404 }),
    );
  });

  it('fetches PDFs for current, all, and selected records with authentication', async () => {
    const pdf = '%PDF-1.7\nbinary contents';
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(
        async () => new Response(pdf, { headers: { 'Content-Type': 'application/pdf' } }),
      );
    const client = new TaskClient({
      baseUrl: 'https://api.example.test/',
      fetcher,
      accessTokenProvider: () => 'print-token',
    });

    expect(await (await client.print(42)).text()).toBe(pdf);
    expect(await (await client.printAll()).text()).toBe(pdf);
    expect(await (await client.printSelected([42, 7])).text()).toBe(pdf);

    await expectRequest(fetcher, 1, 'https://api.example.test/api/v1/task/42/print.pdf');
    await expectRequest(fetcher, 2, 'https://api.example.test/api/v1/task/print.pdf');
    await expectRequest(
      fetcher,
      3,
      'https://api.example.test/api/v1/task/print-selected.pdf',
      'POST',
      JSON.stringify({ ids: [42, 7] }),
      'application/json',
    );
    for (const [request] of fetcher.mock.calls) {
      expect(request).toBeInstanceOf(Request);
      if (request instanceof Request) {
        expect(request.headers.get('Accept')).toBe('application/pdf');
        expect(request.headers.get('Authorization')).toBe('Bearer print-token');
      }
    }
  });

  it('uses the latest configured API token for binary requests', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('%PDF-1.7', {
        headers: { 'Content-Type': 'application/pdf' },
      }),
    );
    const client = new TaskClient({ baseUrl: 'https://api.example.test' });
    configureTaskApi('https://configured.example.test', () => 'updated-token', fetcher);

    await client.printAll();

    await expectRequest(fetcher, 1, 'https://configured.example.test/api/v1/task/print.pdf');
    const request = fetcher.mock.calls[0][0];
    if (request instanceof Request)
      expect(request.headers.get('Authorization')).toBe('Bearer updated-token');
  });

  it.each([400, 401, 403, 404, 422, 500])(
    'reports HTTP %s PDF errors without returning a blob',
    async (status) => {
      const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('Error', { status }));
      const client = new TaskClient({ baseUrl: 'https://api.example.test', fetcher });

      await expect(client.printSelected([42])).rejects.toEqual(
        expect.objectContaining<Partial<TaskError>>({ status }),
      );
    },
  );

  it('rejects non-PDF and empty responses', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response('{}', { headers: { 'Content-Type': 'application/json' } }),
      )
      .mockResolvedValueOnce(new Response('', { headers: { 'Content-Type': 'application/pdf' } }));
    const client = new TaskClient({ baseUrl: 'https://api.example.test', fetcher });

    await expect(client.printAll()).rejects.toThrow('did not return a PDF');
    await expect(client.printAll()).rejects.toThrow('empty PDF');
  });

  it.each([[], [0], [-1], [1.5], Array.from({ length: 1001 }, (_, index) => index + 1)])(
    'rejects invalid selected IDs before fetching',
    async (...ids) => {
      const fetcher = vi.fn<typeof fetch>();
      const client = new TaskClient({ baseUrl: 'https://api.example.test', fetcher });

      await expect(client.printSelected(ids)).rejects.toThrow('Select between 1 and 1000');
      expect(fetcher).not.toHaveBeenCalled();
    },
  );
});

async function expectRequest(
  fetcher: ReturnType<typeof vi.fn<typeof fetch>>,
  callNumber: number,
  url: string,
  method = 'GET',
  body?: string,
  contentType?: string,
) {
  const request = fetcher.mock.calls[callNumber - 1]?.[0] as Request;
  expect(request).toBeInstanceOf(Request);
  expect(request.url).toBe(url);
  expect(request.method).toBe(method);
  if (body !== undefined) expect(await request.text()).toBe(body);
  if (contentType) expect(request.headers.get('Content-Type')).toBe(contentType);
}
