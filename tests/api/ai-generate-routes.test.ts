import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as generatePost } from '@/app/api/ai/generate/route';
import { POST as batchPost } from '@/app/api/ai/generate-batch/route';

const { getSessionFromRequest } = vi.hoisted(() => ({ getSessionFromRequest: vi.fn() }));
vi.mock('@/lib/auth', async () => ({ ...(await vi.importActual('@/lib/auth')), getSessionFromRequest }));

beforeEach(()=>{vi.clearAllMocks(); getSessionFromRequest.mockReturnValue(null);});

describe('ai generate routes', ()=>{
  it('rejects unauthenticated access', async ()=>{
    const req = new NextRequest('http://x',{method:'POST',body:'{}',headers:{'content-type':'application/json'}});
    expect((await generatePost(req)).status).toBe(401);
    expect((await batchPost(req)).status).toBe(401);
  });

  it('validation failure does not leak secrets/paths', async ()=>{
    getSessionFromRequest.mockReturnValue({userId:'u1'});
    const res = await generatePost(new NextRequest('http://x',{method:'POST',body:JSON.stringify({prompt:''}),headers:{'content-type':'application/json'}}));
    const text = await res.text();
    expect([400,422]).toContain(res.status);
    expect(text).not.toMatch(/api[_-]?key|secret|token|\/home\/|\/var\/lib\//i);
  });
});
