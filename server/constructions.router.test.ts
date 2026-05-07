import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as dbHelpers from "./db-helpers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userOverride?: Partial<AuthenticatedUser>): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...userOverride,
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("constructions.getByDesign", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns existing dwg/pdf file metadata for a design", async () => {
    vi.spyOn(dbHelpers, "getDesignById").mockResolvedValue({
      id: 390049,
      projectId: 90001,
    } as Awaited<ReturnType<typeof dbHelpers.getDesignById>>);
    vi.spyOn(dbHelpers, "getDesignConstruction").mockResolvedValue({
      id: 8,
      designId: 390049,
      dwgFileUrl: "https://files.example.com/construction-390049.dwg",
      dwgFileKey: "construction-390049.dwg",
      pdfFileUrl: "https://files.example.com/construction-390049.pdf",
      pdfFileKey: "construction-390049.pdf",
      version: 3,
      createdAt: new Date("2026-05-07T02:00:00.000Z"),
    });

    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.constructions.getByDesign({ designId: 390049 });

    expect(result).toMatchObject({
      designId: 390049,
      hasDwg: true,
      hasPdf: true,
      dwgFileUrl: "https://files.example.com/construction-390049.dwg",
      pdfFileUrl: "https://files.example.com/construction-390049.pdf",
      version: 3,
    });
    expect(result.createdAt).toBe("2026-05-07T02:00:00.000Z");
  });

  it("returns empty file state when no construction record exists", async () => {
    vi.spyOn(dbHelpers, "getDesignById").mockResolvedValue({
      id: 390049,
      projectId: 90001,
    } as Awaited<ReturnType<typeof dbHelpers.getDesignById>>);
    vi.spyOn(dbHelpers, "getDesignConstruction").mockResolvedValue(undefined);

    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.constructions.getByDesign({ designId: 390049 });

    expect(result).toEqual({
      designId: 390049,
      hasDwg: false,
      hasPdf: false,
      dwgFileUrl: null,
      pdfFileUrl: null,
      version: null,
      createdAt: null,
    });
  });

  it("rejects unauthenticated access", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    });

    await expect(caller.constructions.getByDesign({ designId: 390049 })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
