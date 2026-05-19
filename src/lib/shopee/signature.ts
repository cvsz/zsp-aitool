export class ShopeeOpenApiSignatureUnsupportedError extends Error {
  constructor() {
    super("Shopee Open API signature algorithm is not implemented. Add official endpoint-level signing documentation before enabling signed requests.");
    this.name = "ShopeeOpenApiSignatureUnsupportedError";
  }
}

export type ShopeeSignatureInput = {
  path: string;
  timestamp: number;
  partnerId: string;
};

export function signShopeeOpenApiRequest(_input: ShopeeSignatureInput): never {
  throw new ShopeeOpenApiSignatureUnsupportedError();
}
