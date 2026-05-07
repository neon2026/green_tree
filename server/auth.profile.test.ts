import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as dbModule from "./db";

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

describe("auth.updateProfile", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("updates the current user's profile and returns the refreshed record", async () => {
    const updateSpy = vi.spyOn(dbModule, "updateUserProfile").mockResolvedValue({
      id: 1,
      openId: "sample-user",
      email: "updated@example.com",
      name: "Updated Name",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });

    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.auth.updateProfile({
      name: "Updated Name",
      email: "updated@example.com",
    });

    expect(updateSpy).toHaveBeenCalledWith("sample-user", {
      name: "Updated Name",
      email: "updated@example.com",
    });
    expect(result.name).toBe("Updated Name");
    expect(result.email).toBe("updated@example.com");
  });

  it("rejects unauthenticated profile updates", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    });

    await expect(
      caller.auth.updateProfile({
        name: "Updated Name",
        email: null,
      }),
    ).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
