import type { NextApiRequest, NextApiResponse } from "next";

import { hashPassword } from "@/lib/passwords";
import prisma from "@/lib/prisma";
import { createSession } from "@/lib/session";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const firstName = typeof req.body?.firstName === "string" ? req.body.firstName.trim() : "";
  const lastName = typeof req.body?.lastName === "string" ? req.body.lastName.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!email || !firstName || !lastName || password.length < 8) {
    return res.status(400).json({
      message: "First name, last name, valid email, and an 8-character password are required",
    });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ message: "An account with this email already exists" });
  }

  const user = await prisma.user.create({
    data: { email, firstName, lastName, passwordHash: hashPassword(password) },
  });

  await createSession(user.id, res);

  return res.status(201).json({
    status: true,
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
  });
};