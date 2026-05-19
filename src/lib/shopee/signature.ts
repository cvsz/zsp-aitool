export class ShopeeSignatureUnsupportedError extends Error {
  readonly code = "SHOPEE_SIGNATURE_UNSUPPORTED";

  constructor() {
    super("Shopee signature generation is not implemented because endpoint-level signing documentation is not present in docs/reference. Add official endpoint docs before enabling signed calls.");
    this.name = "ShopeeSignatureUnsupportedError";
  }
}

export type ShopeeSignatureInput = {
  path: string;
  timestamp: number;
  accessToken?: string;
  shopId?: string | number;
};

export function buildShopeeSignature(_input: ShopeeSignatureInput): never {
  throw new ShopeeSignatureUnsupportedError();
}
