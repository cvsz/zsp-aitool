import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobStatus } from "@prisma/client";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    aPIUsageLog: {
      aggregate: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

vi.mock("@/lib/env", () => ({
  env: {
    AI_DAILY_BUDGET_USD: 20,
    AI_MAX_REQUESTS_PER_MINUTE: 30,
    OCR_MAX_REQUESTS_PER_MINUTE: 20,
  },
}));

import { BudgetService } from "@/services/BudgetService";
import { AppError } from "@/lib/errors";

describe("BudgetService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDailyUsage", () => {
    it("returns aggregated sum of costUsd as a number", async () => {
      prismaMock.aPIUsageLog.aggregate.mockResolvedValueOnce({
        _sum: { costUsd: 12.3456 },
      });

      const usage = await BudgetService.getDailyUsage("user-1");
      expect(usage).toBe(12.3456);
      expect(prismaMock.aPIUsageLog.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: "user-1",
            deletedAt: null,
          }),
        })
      );
    });

    it("sums and returns daily cost from aPIUsageLog", async () => {
      prismaMock.aPIUsageLog.aggregate.mockResolvedValueOnce({
        _sum: { costUsd: 12.345 },
      });

      const usage = await BudgetService.getDailyUsage("user-1");
      expect(usage).toBe(12.345);
      expect(prismaMock.aPIUsageLog.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: "user-1",
            deletedAt: null,
          }),
        })
      );
    });

    it("returns 0 if aggregated sum of costUsd is null", async () => {
      prismaMock.aPIUsageLog.aggregate.mockResolvedValueOnce({
        _sum: { costUsd: null },
      });

      const usage = await BudgetService.getDailyUsage("user-1");
      expect(usage).toBe(0);
    });

    it("returns 0 if aggregation returns null costUsd", async () => {
      prismaMock.aPIUsageLog.aggregate.mockResolvedValueOnce({
        _sum: { costUsd: null },
      });

      const usage = await BudgetService.getDailyUsage("user-1");
      expect(usage).toBe(0);
    });
  });

  describe("checkBudget", () => {
    it("resolves successfully if daily cost is below limit", async () => {
      prismaMock.aPIUsageLog.aggregate.mockResolvedValueOnce({
        _sum: { costUsd: 15.0 },
      });

      await expect(BudgetService.checkBudget("user-1")).resolves.not.toThrow();
    });

    it("does not throw if daily usage is below limit", async () => {
      prismaMock.aPIUsageLog.aggregate.mockResolvedValueOnce({
        _sum: { costUsd: 5.0 },
      });

      await expect(BudgetService.checkBudget("user-1")).resolves.not.toThrow();
    });

    it("throws AppError BUDGET_EXCEEDED (429) if daily usage is exactly at limit", async () => {
      prismaMock.aPIUsageLog.aggregate.mockResolvedValueOnce({
        _sum: { costUsd: 20.0 },
      });

      await expect(BudgetService.checkBudget("user-1")).rejects.toThrowError(
        new AppError("BUDGET_EXCEEDED", "Daily AI/OCR budget limit of $20 exceeded (spent $20.0000)", 429)
      );
    });

    it("throws AppError BUDGET_EXCEEDED (429) if daily cost meets/exceeds limit", async () => {
      prismaMock.aPIUsageLog.aggregate.mockResolvedValueOnce({
        _sum: { costUsd: 20.005 },
      });

      await expect(BudgetService.checkBudget("user-1")).rejects.toThrowError(
        new AppError("BUDGET_EXCEEDED", "Daily AI/OCR budget limit of $20 exceeded (spent $20.0050)", 429)
      );
    });

    it("throws AppError BUDGET_EXCEEDED (429) if daily usage is above limit", async () => {
      prismaMock.aPIUsageLog.aggregate.mockResolvedValueOnce({
        _sum: { costUsd: 25.5 },
      });

      await expect(BudgetService.checkBudget("user-1")).rejects.toThrowError(
        new AppError("BUDGET_EXCEEDED", "Daily AI/OCR budget limit of $20 exceeded (spent $25.5000)", 429)
      );
    });
  });

  describe("logUsage", () => {
    it("creates APIUsageLog record with given options", async () => {
      const mockLog = { id: "log-123", userId: "user-1", provider: "openai" };
      prismaMock.aPIUsageLog.create.mockResolvedValueOnce(mockLog);

      const result = await BudgetService.logUsage(
        "user-1",
        "openai",
        "/api/ai/generate",
        0.005,
        JobStatus.COMPLETED,
        { version: 1 }
      );

      expect(result).toEqual(mockLog);
      expect(prismaMock.aPIUsageLog.create).toHaveBeenCalledWith({
        data: {
          userId: "user-1",
          provider: "openai",
          endpoint: "/api/ai/generate",
          costUsd: 0.005,
          status: JobStatus.COMPLETED,
          metadata: { version: 1 },
        },
      });
    });

    it("creates a persistent log record in aPIUsageLog", async () => {
      prismaMock.aPIUsageLog.create.mockResolvedValueOnce({ id: "log-1" });

      await BudgetService.logUsage("user-1", "openai", "/api/ai/generate", 0.05, JobStatus.COMPLETED, { versions: 10 });

      expect(prismaMock.aPIUsageLog.create).toHaveBeenCalledWith({
        data: {
          userId: "user-1",
          provider: "openai",
          endpoint: "/api/ai/generate",
          costUsd: 0.05,
          status: JobStatus.COMPLETED,
          metadata: { versions: 10 },
        },
      });
    });
  });
});
