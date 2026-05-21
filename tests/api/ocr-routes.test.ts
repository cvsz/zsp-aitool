import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as extractPost } from '@/app/api/ocr/extract/route';
import { GET as jobGet } from '@/app/api/ocr/[id]/route';

const { getSessionFromRequest } = vi.hoisted(() => ({ getSessionFromRequest: vi.fn() }));
vi.mock('@/lib/auth', async () => ({ ...(await vi.importActual('@/lib/auth')), getSessionFromRequest }));

beforeEach(()=>{vi.clearAllMocks(); getSessionFromRequest.mockReturnValue(null);});

describe('ocr routes', ()=>{
  it('rejects unauthenticated extract and lookup', async ()=>{
    const req = new NextRequest('http://x/api/ocr/extract',{method:'POST',body:'{}',headers:{'content-type':'application/json'}});
    expect((await extractPost(req)).status).toBe(401);
    expect((await jobGet(new NextRequest('http://x/api/ocr/1'),{params:Promise.resolve({id:'1'})})).status).toBe(401);
  });

  it('invalid payload returns safe validation response', async ()=>{
    getSessionFromRequest.mockReturnValue({userId:'u1'});
    const res = await extractPost(new NextRequest('http://x/api/ocr/extract',{method:'POST',body:JSON.stringify({}),headers:{'content-type':'application/json'}}));
    const text = await res.text();
    expect([400,422,500]).toContain(res.status);
    expect(text).not.toMatch(/api[_-]?key|secret|\/home\/|\/var\/lib\//i);
  });
});
