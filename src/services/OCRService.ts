export interface OCRProvider { extractText:(imageUrl:string)=>Promise<{text:string;confidence?:number}>; }
export class OCRService { constructor(private readonly provider: OCRProvider) {} async extract(imageUrl:string){ if(!imageUrl) throw new Error('imageUrl is required'); return this.provider.extractText(imageUrl);} }
