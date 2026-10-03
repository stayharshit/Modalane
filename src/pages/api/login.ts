import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/passwords";
import { createSession } from "@/lib/session";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  await createSession(user.id, res);

  return res.status(200).json({
    status: true,
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
  });
};
