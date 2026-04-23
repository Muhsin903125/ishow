import { ApiError } from "@/lib/server/api";

export function ensureObject(value: unknown, message = "Invalid payload") {
  if (!value || typeof value !== "object") {
    throw new ApiError(400, message);
  }

  return value as Record<string, unknown>;
}

export function requiredString(
  value: unknown,
  message: string,
  options?: { maxLength?: number }
) {
  if (typeof value !== "string") {
    throw new ApiError(400, message);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new ApiError(400, message);
  }

  if (options?.maxLength && trimmed.length > options.maxLength) {
    throw new ApiError(400, message);
  }

  return trimmed;
}

export function optionalString(value: unknown, maxLength?: number) {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") {
    throw new ApiError(400, "Invalid text field");
  }

  const trimmed = value.trim();
  if (!trimmed) return null;
  if (maxLength && trimmed.length > maxLength) {
    throw new ApiError(400, "Text field is too long");
  }

  return trimmed;
}

export function optionalNumber(
  value: unknown,
  options?: { min?: number; max?: number }
) {
  if (value === undefined || value === null || value === "") return null;
  const parsed =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;

  if (Number.isNaN(parsed)) {
    throw new ApiError(400, "Invalid numeric field");
  }

  if (options?.min !== undefined && parsed < options.min) {
    throw new ApiError(400, "Numeric field is below minimum");
  }

  if (options?.max !== undefined && parsed > options.max) {
    throw new ApiError(400, "Numeric field is above maximum");
  }

  return parsed;
}

export function optionalStringArray(value: unknown) {
  if (value === undefined || value === null) return null;
  if (!Array.isArray(value)) {
    throw new ApiError(400, "Invalid list field");
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function enumValue<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  message: string
): T[number] {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new ApiError(400, message);
  }

  return value as T[number];
}
