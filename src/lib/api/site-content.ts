import { apiRequest } from "@/lib/api/client";
import type {
  EditableCMSContent,
  LandingClientTestimonial,
} from "@/lib/cms/content";
import type { PublicContactEnquiry } from "@/lib/contact-enquiry";

export async function loadPublicSiteContent() {
  return apiRequest<{
    ok: true;
    content: EditableCMSContent;
    testimonials: LandingClientTestimonial[];
  }>("/api/public/site-content");
}

export async function submitPublicContactEnquiry(enquiry: PublicContactEnquiry) {
  return apiRequest<{ ok: true; message: string }>("/api/public/contact-enquiry", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ enquiry }),
  });
}
