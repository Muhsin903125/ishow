import type { NextApiResponse } from "next";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function sendMethodNotAllowed(
  res: NextApiResponse,
  methods: string[]
) {
  res.setHeader("Allow", methods.join(", "));
  return res.status(405).json({ error: "Method not allowed" });
}

export function sendSuccess<T>(
  res: NextApiResponse,
  payload: T,
  status = 200
) {
  return res.status(status).json(payload);
}

export function sendError(
  res: NextApiResponse,
  status: number,
  message: string
) {
  return res.status(status).json({ error: message });
}

export function handleApiError(
  res: NextApiResponse,
  error: unknown,
  context: string
) {
  if (error instanceof ApiError) {
    return sendError(res, error.status, error.message);
  }

  console.error(context, error);
  return sendError(res, 500, "Internal server error");
}
