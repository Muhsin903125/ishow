import { describe, expect, it } from "vitest";
import {
  derivePaymentStatus,
  getPaymentBalance,
  normalizePaidAmount,
} from "../src/lib/server/payments";

describe("payment balance helpers", () => {
  it("caps paid amount at the invoice total", () => {
    expect(normalizePaidAmount(1000, 1400)).toBe(1000);
  });

  it("calculates remaining balance from total minus paid", () => {
    expect(getPaymentBalance(1000, 400)).toBe(600);
  });

  it("keeps partially paid invoices pending before the due date", () => {
    expect(
      derivePaymentStatus({
        amount: 1000,
        paidAmount: 400,
        dueDate: "2026-05-01",
        today: "2026-04-23",
      })
    ).toBe("pending");
  });

  it("marks partially paid invoices overdue after the due date", () => {
    expect(
      derivePaymentStatus({
        amount: 1000,
        paidAmount: 400,
        dueDate: "2026-04-01",
        today: "2026-04-23",
      })
    ).toBe("overdue");
  });

  it("marks fully paid invoices as paid", () => {
    expect(
      derivePaymentStatus({
        amount: 1000,
        paidAmount: 1000,
        dueDate: "2026-04-01",
        today: "2026-04-23",
      })
    ).toBe("paid");
  });
});
