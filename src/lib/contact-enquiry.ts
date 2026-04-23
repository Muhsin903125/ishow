export type PublicContactEnquiryInput = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
};

export type PublicContactEnquiry = {
  name: string;
  email: string;
  phone: string | null;
  message: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanRequiredString(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function cleanOptionalString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function clampText(value: string, maxLength: number) {
  return value.length > maxLength ? value.slice(0, maxLength).trim() : value;
}

export function normalizePublicContactEnquiry(
  input: PublicContactEnquiryInput | null | undefined
): PublicContactEnquiry {
  return {
    name: clampText(cleanRequiredString(input?.name), 120),
    email: clampText(cleanRequiredString(input?.email).toLowerCase(), 160),
    phone: clampText(cleanOptionalString(input?.phone) ?? "", 40) || null,
    message: clampText(cleanRequiredString(input?.message), 2_000),
  };
}

export function validatePublicContactEnquiry(input: PublicContactEnquiry) {
  if (!input.name) {
    throw new Error("Name is required");
  }

  if (!input.email) {
    throw new Error("Email is required");
  }

  if (!EMAIL_PATTERN.test(input.email)) {
    throw new Error("A valid email address is required");
  }

  if (!input.message) {
    throw new Error("Message is required");
  }
}

export function formatPublicEnquiryNotes(message: string) {
  return `Website enquiry\n\n${message.trim()}`;
}
