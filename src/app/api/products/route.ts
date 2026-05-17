import { NextResponse } from 'next/server';
import { ProductService } from '@/services/ProductService';
export async function GET(){ const service=new ProductService({product:{findFirst:async()=>null,create:async()=>{throw new Error('not used');},findMany:async()=>[]}}); const products=await service.listByUser('demo-user'); return NextResponse.json({data:products}); }
