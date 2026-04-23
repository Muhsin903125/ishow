import { describe, expect, it } from "vitest";
import {
  formatPublicEnquiryNotes,
  normalizePublicContactEnquiry,
  validatePublicContactEnquiry,
} from "../src/lib/contact-enquiry";

describe("public contact enquiry helpers", () => {
  it("normalizes strings and trims optional values", () => {
    const enquiry = normalizePublicContactEnquiry({
      name: "  Test User  ",
      email: "  PERSON@Example.com  ",
      phone: "  +971 555 000  ",
      message: "  Need help getting started.  ",
    });

    expect(enquiry).toEqual({
      name: "Test User",
      email: "person@example.com",
      phone: "+971 555 000",
      message: "Need help getting started.",
    });
  });

  it("rejects invalid email addresses", () => {
    expect(() =>
      validatePublicContactEnquiry({
        name: "Test",
        email: "not-an-email",
        phone: null,
        message: "Hello",
      })
    ).toThrow("valid email");
  });

  it("formats lead notes with a clear website enquiry prefix", () => {
    expect(formatPublicEnquiryNotes("Need a consultation")).toContain("Website enquiry");
  });
});
