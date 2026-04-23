import type { EmailType } from "./sender";

export async function notify(
  type: EmailType,
  to: string,
  data: Record<string, string | number | undefined>
) {
  try {
    const response = await fetch("/api/email/send", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, to, data }),
    });

    if (!response.ok) {
      console.warn("[notify] email request rejected");
    }
  } catch {
    // Non-blocking - never throw on email failure.
  }
}
