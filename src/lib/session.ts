import { randomBytes } from "node:crypto";
import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/lib/prisma";

const sessionDurationMs = 1000 * 60 * 60 * 24 * 7;

const parseCookies = (cookieHeader = "") =>
  Object.fromEntries(
    cookieHeader.split(";").map((part) => {
      const [key, ...value] = part.trim().split("=");
      return [key, decodeURIComponent(value.join("="))];
    }),
  );

export const createSession = async (userId: string, res: NextApiResponse) => {
  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + sessionDurationMs);

  await prisma.session.create({ data: { id, userId, expiresAt } });
  res.setHeader(
    "Set-Cookie",
    `modalane_session=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionDurationMs / 1000}${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`,
  );
};

export const getSessionUser = async (req: Pick<NextApiRequest, "headers">) => {
  const sessionId = parseCookies(req.headers.cookie).modalane_session;
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.expiresAt <= new Date()) return null;
  return session.user;
};

export const endSession = async (req: NextApiRequest, res: NextApiResponse) => {
  const sessionId = parseCookies(req.headers.cookie).modalane_session;
  if (sessionId) {
    await prisma.session.deleteMany({ where: { id: sessionId } });
  }

  res.setHeader(
    "Set-Cookie",
    `modalane_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`,
  );
};
