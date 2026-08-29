import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorBody(message: string, status: number, extra?: object) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function handleRouteError(err: unknown) {
  if (err instanceof AppError) {
    return errorBody(err.message, err.status);
  }
  if (err instanceof ZodError) {
    return errorBody("Invalid request", 400, { issues: err.issues });
  }
  if (err instanceof SyntaxError) {
    return errorBody("Invalid JSON", 400);
  }
  console.error(err);
  return errorBody("Internal server error", 500);
}
