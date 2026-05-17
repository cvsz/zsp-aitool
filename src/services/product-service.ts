import { prisma } from "@/lib/prisma";

export class ProductService {
  static async listProducts() {
    return prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  }

  static async getProductById(productId: string) {
    return prisma.product.findUnique({ where: { id: productId } });
  }
}
