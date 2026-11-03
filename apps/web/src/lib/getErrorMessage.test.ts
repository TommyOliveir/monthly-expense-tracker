import { describe, expect, it } from "vitest";
import { ApiError } from "@/api/client";
import { getErrorMessage } from "@/lib/getErrorMessage";

describe("getErrorMessage", () => {
  it("uses the API's message for client errors", () => {
    expect(
      getErrorMessage(new ApiError(409, "That category already exists.")),
    ).toBe("That category already exists.");
  });

  it("hides server internals behind a friendly message", () => {
    expect(
      getErrorMessage(new ApiError(500, "PrismaClientKnownRequestError")),
    ).toBe("The server had a problem. Please try again in a moment.");
  });

  it("explains network failures", () => {
    expect(getErrorMessage(new TypeError("Failed to fetch"))).toBe(
      "Can't reach the server. Check your connection and try again.",
    );
  });

  it("falls back for unknown values", () => {
    expect(getErrorMessage("boom")).toBe(
      "Something went wrong. Please try again.",
    );
  });
});
