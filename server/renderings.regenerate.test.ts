import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const { generateImageMock, getDesignByIdMock, getRenderingHistoryMock, createRenderingMock } = vi.hoisted(() => ({
  generateImageMock: vi.fn(),
  getDesignByIdMock: vi.fn(),
  getRenderingHistoryMock: vi.fn(),
  createRenderingMock: vi.fn(),
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

describe("renderings.regenerateArea", () => {
  beforeEach(() => {
    generateImageMock.mockReset();
    getDesignByIdMock.mockReset();
    getRenderingHistoryMock.mockReset();
    createRenderingMock.mockReset();

    getDesignByIdMock.mockResolvedValue({
      id: 360004,
      styleTheme: "party_k",
      colorScheme: "neon purple and cyan",
      parameters: JSON.stringify({
        cadParameters: {
          totalArea: 600,
          machineCount: 24,
          roomCount: 6,
        },
        rgbDensity: "high",
      }),
    });
    getRenderingHistoryMock.mockResolvedValue([{ areaType: "bar", version: 2 }]);
    createRenderingMock.mockResolvedValue({ insertId: 999 });
  });

  it("returns a successful fallback rendering when the image provider fails", async () => {
    generateImageMock.mockRejectedValueOnce(new Error("usage exhausted"));

    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.renderings.regenerateArea({
      designId: 360004,
      area: "bar",
    });

    expect(result.success).toBe(true);
    expect(result.rendering.area).toBe("bar");
    expect(result.rendering.version).toBe(3);
    expect(result.rendering.url.startsWith("data:image/svg+xml;base64,")).toBe(true);
    expect(createRenderingMock).toHaveBeenCalledWith(
      expect.objectContaining({
        designId: 360004,
        areaType: "bar",
        version: 3,
      })
    );
  });
});
