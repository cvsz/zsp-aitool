import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PUT } from '@/app/api/settings/route';

const { getSessionFromRequest } = vi.hoisted(() => ({ getSessionFromRequest: vi.fn() }));
vi.mock('@/lib/auth', async () => ({ ...(await vi.importActual('@/lib/auth')), getSessionFromRequest }));

beforeEach(()=>{vi.clearAllMocks(); getSessionFromRequest.mockReturnValue(null);});

describe('settings route', ()=>{
  it('rejects unauthenticated', async ()=>{
    expect((await GET(new NextRequest('http://x/api/settings'))).status).toBe(401);
    const putReq = new NextRequest('http://x/api/settings',{method:'PUT',body:'{}',headers:{'content-type':'application/json'}});
    expect((await PUT(putReq)).status).toBe(401);
  });
});
