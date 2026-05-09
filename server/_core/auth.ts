/**
 * Email/password authentication helpers.
 * Replaces the Manus OAuth flow with a self-contained register/login system.
 */
import bcrypt from "bcryptjs";
import type { Express, Request, Response } from "express";
import { nanoid } from "nanoid";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const SALT_ROUNDS = 10;

/** Hash a plain-text password */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/** Verify a plain-text password against a stored hash */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Register email/password routes on the Express app */
export function registerAuthRoutes(app: Express) {
  // ── POST /api/auth/register ──────────────────────────────────────────────
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { name, email, password } = req.body ?? {};

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      res.status(400).json({ error: "请输入姓名" });
      return;
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "请输入有效的邮箱地址" });
      return;
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      res.status(400).json({ error: "密码至少需要 6 位" });
      return;
    }

    // Check if email already registered
    const existing = await db.getUserByOpenId(email.toLowerCase());
    if (existing) {
      res.status(409).json({ error: "该邮箱已注册，请直接登录" });
      return;
    }

    const passwordHash = await hashPassword(password);
    const openId = email.toLowerCase(); // use email as openId for email users

    await db.upsertUser({
      openId,
      name: name.trim(),
      email: email.toLowerCase(),
      loginMethod: "email",
      passwordHash,
      lastSignedIn: new Date(),
    });

    const sessionToken = await sdk.createSessionToken(openId, {
      name: name.trim(),
      expiresInMs: ONE_YEAR_MS,
    });

    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
    res.json({ success: true });
  });

  // ── POST /api/auth/login ─────────────────────────────────────────────────
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json({ error: "请输入邮箱和密码" });
      return;
    }

    const user = await db.getUserByOpenId(email.toLowerCase());
    if (!user || !user.passwordHash) {
      res.status(401).json({ error: "邮箱或密码错误" });
      return;
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "邮箱或密码错误" });
      return;
    }

    // Update lastSignedIn
    await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });

    const sessionToken = await sdk.createSessionToken(user.openId, {
      name: user.name ?? "",
      expiresInMs: ONE_YEAR_MS,
    });

    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
    res.json({ success: true });
  });
}
