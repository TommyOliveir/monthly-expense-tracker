import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ErrorPage from "@/app/error";
import NotFound from "@/app/not-found";

describe("ErrorPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("replaces a crashed page with a way to retry or go back", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const retry = vi.fn();
    render(<ErrorPage error={new Error("boom")} retry={retry} />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    // Internal details stay in the console, not on screen.
    expect(screen.queryByText("boom")).toBeNull();
    expect(
      screen.getByRole("link", { name: "Back to your ledger" }),
    ).toHaveAttribute("href", "/tracker");

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});

describe("NotFound", () => {
  it("points an unknown URL back into the app", () => {
    render(<NotFound />);

    expect(screen.getByText("Page not found")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Go to your ledger" }),
    ).toHaveAttribute("href", "/tracker");
  });
});
