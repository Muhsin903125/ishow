import type { NextApiRequest, NextApiResponse } from "next";
import {
  formatPublicEnquiryNotes,
  normalizePublicContactEnquiry,
  validatePublicContactEnquiry,
} from "@/lib/contact-enquiry";
import { normalizeLeadDraft, toLeadInsert } from "@/lib/leads";
import { ApiError, handleApiError, sendMethodNotAllowed, sendSuccess } from "@/lib/server/api";
import { createRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service";

type PublicContactEnquiryResponse =
  | { ok: true; message: string }
  | { error: string };

function hasEnquiryPayload(
  body: unknown
): body is { enquiry: Record<string, unknown> } {
  return !!body && typeof body === "object" && "enquiry" in body;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "32kb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PublicContactEnquiryResponse>
) {
  if (req.method !== "POST") {
    return sendMethodNotAllowed(res, ["POST"]);
  }

  if (
    !enforceRateLimit(req, res, {
      bucket: "public:contact-enquiry",
      limit: 6,
      windowMs: 60_000,
      key: createRateLimitKey(req, "public:contact-enquiry"),
    })
  ) {
    return;
  }

  try {
    if (!hasEnquiryPayload(req.body)) {
      throw new ApiError(400, "Invalid enquiry payload");
    }

    const enquiry = normalizePublicContactEnquiry(req.body.enquiry);
    validatePublicContactEnquiry(enquiry);

    const service = createServiceRoleClient();
    const lead = normalizeLeadDraft({
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone,
      source: "website enquiry",
      status: "new",
      notes: formatPublicEnquiryNotes(enquiry.message),
    });

    const { error } = await service.from("leads").insert(toLeadInsert(lead));

    if (error) {
      throw new ApiError(500, "Failed to submit enquiry");
    }

    return sendSuccess(
      res,
      {
        ok: true,
        message: "Your enquiry has been received.",
      },
      201
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return handleApiError(res, error, "[api/public/contact-enquiry][POST]");
    }

    if (error instanceof Error) {
      return handleApiError(
        res,
        new ApiError(400, error.message),
        "[api/public/contact-enquiry][POST]"
      );
    }

    return handleApiError(res, error, "[api/public/contact-enquiry][POST]");
  }
}
