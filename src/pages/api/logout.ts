import type { NextApiRequest, NextApiResponse } from "next";

import { endSession } from "@/lib/session";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  await endSession(req, res);
  return res.status(200).json({ status: true });
};