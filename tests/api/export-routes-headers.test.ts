import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as productsGet } from '@/app/api/export/products.csv/route';
import { GET as contentCsvGet } from '@/app/api/export/content.csv/route';
import { GET as contentMdGet } from '@/app/api/export/content.md/route';
import { GET as contentTxtGet } from '@/app/api/export/content/[id].txt/route';

const { getSessionFromRequest } = vi.hoisted(() => ({ getSessionFromRequest: vi.fn() }));
vi.mock('@/lib/auth', async () => ({ ...(await vi.importActual('@/lib/auth')), getSessionFromRequest }));

beforeEach(()=>{vi.clearAllMocks(); getSessionFromRequest.mockReturnValue(null);});

describe('export routes headers', ()=>{
  it('require authentication', async ()=>{
    expect((await productsGet(new NextRequest('http://x'))).status).toBe(401);
    expect((await contentCsvGet(new NextRequest('http://x'))).status).toBe(401);
    expect((await contentMdGet(new NextRequest('http://x'))).status).toBe(401);
    expect((await contentTxtGet(new NextRequest('http://x'),{params:Promise.resolve({id:'1'})})).status).toBe(401);
  });
});
