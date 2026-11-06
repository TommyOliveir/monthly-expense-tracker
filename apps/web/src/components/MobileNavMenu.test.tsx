import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MobileNavMenu } from "@/components/MobileNavMenu";

const LINKS = [
  { href: "/tracker", label: "Tracker" },
  { href: "/about", label: "About" },
] as const;

type RenderOptions = {
  onLogout?: () => void;
  isLoggingOut?: boolean;
};

function renderMenu({
  onLogout = vi.fn(),
  isLoggingOut = false,
}: RenderOptions = {}) {
  render(
    <MobileNavMenu
      links={LINKS}
      pathname="/tracker"
      displayName="Juan Dela Cruz"
      email="juan@example.com"
      onLogout={onLogout}
      isLoggingOut={isLoggingOut}
    />,
  );
}

async function openMenu() {
  fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
  return screen.findByRole("dialog");
}

describe("MobileNavMenu", () => {
  it("opens a drawer with the user and navigation links", async () => {
    renderMenu();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const dialog = await openMenu();

    expect(dialog).toHaveTextContent("Juan Dela Cruz");
    expect(dialog).toHaveTextContent("juan@example.com");
    expect(screen.getByRole("link", { name: "Tracker" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
  });

  it("marks the current route as active", async () => {
    renderMenu();
    await openMenu();

    expect(screen.getByRole("link", { name: "Tracker" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "About" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("closes the drawer when a link is chosen", async () => {
    renderMenu();
    await openMenu();

    fireEvent.click(screen.getByRole("link", { name: "About" }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("calls onLogout from the drawer", async () => {
    const onLogout = vi.fn();
    renderMenu({ onLogout });
    await openMenu();

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    expect(onLogout).toHaveBeenCalledOnce();
  });

  it("disables log out while logging out", async () => {
    renderMenu({ isLoggingOut: true });
    await openMenu();

    expect(screen.getByRole("button", { name: "Logging out…" })).toBeDisabled();
  });
});
