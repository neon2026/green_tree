import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const {
  generateImageMock,
  getDesignByIdMock,
  getRenderingHistoryMock,
  createRenderingMock,
  updateDesignMock,
  createIterationMock,
} = vi.hoisted(() => ({
  generateImageMock: vi.fn(),
  getDesignByIdMock: vi.fn(),
  getRenderingHistoryMock: vi.fn(),
  createRenderingMock: vi.fn(),
  updateDesignMock: vi.fn(),
  createIterationMock: vi.fn(),
}));

vi.mock("./_core/imageGeneration", () => ({
  generateImage: generateImageMock,
}));

vi.mock("./db-helpers", async () => {
  const actual = await vi.importActual<typeof import("./db-helpers")>("./db-helpers");
  return {
    ...actual,
    getDesignById: getDesignByIdMock,
    getRenderingHistory: getRenderingHistoryMock,
    createRendering: createRenderingMock,
    updateDesign: updateDesignMock,
    createIteration: createIterationMock,
  };
});

import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as TrpcContext["res"],
  };
}

describe("renderings.iterate", () => {
  beforeEach(() => {
    generateImageMock.mockReset();
    getDesignByIdMock.mockReset();
    getRenderingHistoryMock.mockReset();
    createRenderingMock.mockReset();
    updateDesignMock.mockReset();
    createIterationMock.mockReset();

    getDesignByIdMock.mockResolvedValue({
      id: 390049,
      styleTheme: "party_k",
      colorScheme: "neon purple and cyan",
      budgetRange: "standard",
      parameters: JSON.stringify({
        cadParameters: {
          totalArea: 600,
          machineCount: 24,
          roomCount: 6,
        },
        rgbDensity: "medium",
      }),
    });
    getRenderingHistoryMock.mockResolvedValue([{ areaType: "bar", version: 2 }]);
    createRenderingMock.mockResolvedValue({ insertId: 1200 });
    updateDesignMock.mockResolvedValue({});
    createIterationMock.mockResolvedValue({ insertId: 1 });
  });

  it("regenerates targeted areas and stores iteration metadata", async () => {
    generateImageMock.mockResolvedValue({ url: "https://example.com/bar-updated.png" });

    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.renderings.iterate({
      designId: 390049,
      instruction: "把吧台灯光调得更亮一点",
    });

    expect(result.success).toBe(true);
    expect(result.affectedAreas).toEqual(["bar"]);
    expect(result.renderings).toHaveLength(1);
    expect(result.renderings[0].area).toBe("bar");
    expect(result.renderings[0].version).toBe(3);
    expect(updateDesignMock).toHaveBeenCalledWith(
      390049,
      expect.objectContaining({
        colorScheme: "neon purple and cyan",
      })
    );
    expect(createIterationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        designId: 390049,
        instruction: "把吧台灯光调得更亮一点",
      })
    );
  });

  it("treats global instructions as all-area rerender requests", async () => {
    generateImageMock.mockResolvedValue({ url: "https://example.com/global-updated.png" });

    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.renderings.iterate({
      designId: 390049,
      instruction: "整体改成更高端的紫色氛围",
    });

    expect(result.success).toBe(true);
    expect(result.affectedAreas).toEqual(["entrance", "corridor", "bar", "stage", "seating", "private_room", "restroom"]);
    expect(result.renderings).toHaveLength(7);
    expect(createRenderingMock).toHaveBeenCalledTimes(7);
    expect(updateDesignMock).toHaveBeenCalledWith(
      390049,
      expect.objectContaining({
        colorScheme: "neon purple",
        budgetRange: "premium",
      })
    );
  });

  it("returns a safe warning and skips persistence when no area is identified", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.renderings.iterate({
      designId: 390049,
      instruction: "把氛围改得更有未来感",
    });

    expect(result.success).toBe(false);
    expect(result.affectedAreas).toEqual([]);
    expect(result.warningMessage).toContain("请明确说明要调整的区域");
    expect(generateImageMock).not.toHaveBeenCalled();
    expect(createRenderingMock).not.toHaveBeenCalled();
    expect(updateDesignMock).not.toHaveBeenCalled();
    expect(createIterationMock).not.toHaveBeenCalled();
  });

  it("only rerenders the explicitly matched multiple areas", async () => {
    generateImageMock.mockResolvedValue({ url: "https://example.com/multi-area-updated.png" });

    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.renderings.iterate({
      designId: 390049,
      instruction: "把吧台和包间的灯光调得更亮一点",
    });

    expect(result.success).toBe(true);
    expect(result.affectedAreas).toEqual(["bar", "private_room"]);
    expect(result.renderings).toHaveLength(2);
    expect(result.renderings.map((item) => item.area)).toEqual(["bar", "private_room"]);
    expect(createRenderingMock).toHaveBeenCalledTimes(2);
  });
});
