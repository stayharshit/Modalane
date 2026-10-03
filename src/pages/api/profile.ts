import type { NextApiRequest, NextApiResponse } from "next";

import { getSessionUser } from "@/lib/session";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await getSessionUser(req);
  if (!user) return res.status(401).json({ message: "Authentication required" });

  return res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    },
  });
};