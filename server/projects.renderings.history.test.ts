import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const {
  getProjectDesignsMock,
  getDesignByIdMock,
  getLatestRenderingsByAreaMock,
  getProjectRenderingHistoryMock,
} = vi.hoisted(() => ({
  getProjectDesignsMock: vi.fn(),
  getDesignByIdMock: vi.fn(),
  getLatestRenderingsByAreaMock: vi.fn(),
  getProjectRenderingHistoryMock: vi.fn(),
}));

vi.mock("./db-helpers", async () => {
  const actual = await vi.importActual<typeof import("./db-helpers")>("./db-helpers");
  return {
    ...actual,
    getProjectDesigns: getProjectDesignsMock,
    getDesignById: getDesignByIdMock,
    getLatestRenderingsByArea: getLatestRenderingsByAreaMock,
    getProjectRenderingHistory: getProjectRenderingHistoryMock,
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

describe("projects style labels and renderings history", () => {
  beforeEach(() => {
    getProjectDesignsMock.mockReset();
    getDesignByIdMock.mockReset();
    getLatestRenderingsByAreaMock.mockReset();
    getProjectRenderingHistoryMock.mockReset();
  });

  it("maps the stored party_k style identifier to the Party K label for project design lists", async () => {
    getProjectDesignsMock.mockResolvedValue([
      {
        id: 360004,
        projectId: 60002,
        styleTheme: "party_k",
        colorScheme: "Neon Purple + Cyan",
        budgetRange: "premium",
        parameters: "{}",
        status: "draft",
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.designs.list({ projectId: 60002 });

    expect(result).toHaveLength(1);
    expect(result[0].styleId).toBe("party_k");
    expect(result[0].styleTheme).toBe("Party K");
  });

  it("returns project-scoped history so a single design page can show all generated images for the current project", async () => {
    const now = new Date("2026-05-07T01:00:00.000Z");

    getDesignByIdMock.mockResolvedValue({
      id: 360004,
      projectId: 60002,
      styleTheme: "party_k",
      colorScheme: "Neon Purple + Cyan",
      parameters: JSON.stringify({ rgbDensity: "high" }),
      status: "draft",
      version: 1,
      createdAt: now,
      updatedAt: now,
    });

    getLatestRenderingsByAreaMock.mockResolvedValue([
      {
        id: 11,
        designId: 360004,
        areaType: "bar",
        imageUrl: "https://example.com/current-bar.png",
        version: 2,
        createdAt: now,
      },
    ]);

    getProjectRenderingHistoryMock.mockResolvedValue([
      {
        id: 11,
        designId: 360004,
        areaType: "bar",
        imageUrl: "https://example.com/current-bar.png",
        version: 2,
        createdAt: now,
        styleTheme: "party_k",
      },
      {
        id: 7,
        designId: 359998,
        areaType: "stage",
        imageUrl: "https://example.com/older-stage.png",
        version: 1,
        createdAt: new Date("2026-05-06T01:00:00.000Z"),
        styleTheme: "future_tech",
      },
    ]);

    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.renderings.list({ designId: 360004 });

    expect(getProjectRenderingHistoryMock).toHaveBeenCalledWith(60002);
    expect(result.renderings[0].styleTheme).toBe("Party K");
    expect(result.history).toHaveLength(2);
    expect(result.history[0]).toMatchObject({
      designId: 360004,
      label: "吧台",
      styleTheme: "Party K",
    });
    expect(result.history[1]).toMatchObject({
      designId: 359998,
      label: "舞台",
      styleTheme: "Future Tech",
    });
  });
});
