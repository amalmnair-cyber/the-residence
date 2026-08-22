import { describe, expect, it } from "vitest";
import { bookingInputSchema, emailPattern, phonePattern } from "./validation";

describe("emailPattern", () => {
  it("accepts valid addresses", () => {
    expect(emailPattern.test("guest@example.com")).toBe(true);
    expect(emailPattern.test("first.last+tag@sub.example.co.uk")).toBe(true);
  });

  it("rejects invalid addresses", () => {
    expect(emailPattern.test("not-an-email")).toBe(false);
    expect(emailPattern.test("missing@domain")).toBe(false);
    expect(emailPattern.test("@example.com")).toBe(false);
    expect(emailPattern.test("has space@example.com")).toBe(false);
  });
});

describe("phonePattern", () => {
  it("accepts real-world formats", () => {
    expect(phonePattern.test("+44 7700 900111")).toBe(true);
    expect(phonePattern.test("020 7946 0958")).toBe(true);
  });

  it("requires the string to start with a digit or +, not a leading paren", () => {
    expect(phonePattern.test("(020) 7946-0958")).toBe(false);
  });

  it("rejects too-short input", () => {
    expect(phonePattern.test("12345")).toBe(false);
  });

  it("rejects letters", () => {
    expect(phonePattern.test("+44 CALL NOW")).toBe(false);
  });
});

function validBooking() {
  return {
    propertyId: "c7578989-730a-4add-a01e-d7d988107bd1",
    checkIn: new Date(2026, 7, 26),
    checkOut: new Date(2026, 7, 29),
    guests: 2,
    name: "Test Guest",
    email: "guest@example.com",
    phone: "+44 7700 900111",
    country: "United Kingdom",
  };
}

describe("bookingInputSchema", () => {
  it("accepts a valid booking", () => {
    expect(bookingInputSchema.safeParse(validBooking()).success).toBe(true);
  });

  it("rejects a non-uuid propertyId", () => {
    const result = bookingInputSchema.safeParse({ ...validBooking(), propertyId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("rejects guests over the generic sanity bound", () => {
    // The real, property-specific max (12 for Elmstead, 8 for Kiln House)
    // is enforced in submitBooking itself, not this schema — it varies per
    // property and the schema has no way to know which one applies yet.
    const result = bookingInputSchema.safeParse({ ...validBooking(), guests: 21 });
    expect(result.success).toBe(false);
  });

  it("rejects a one-character name", () => {
    const result = bookingInputSchema.safeParse({ ...validBooking(), name: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects a filled-in honeypot field", () => {
    // The honeypot itself is handled by submitBooking, not this schema — but
    // the schema must still accept the field name without stripping it,
    // otherwise submitBooking could never see it was filled in.
    const result = bookingInputSchema.safeParse({ ...validBooking(), website: "x" });
    expect(result.success).toBe(false);
  });

  it("accepts an empty honeypot field", () => {
    const result = bookingInputSchema.safeParse({ ...validBooking(), website: "" });
    expect(result.success).toBe(true);
  });
});
