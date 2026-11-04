import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CurrencyPicker } from "@/features/currency/components/CurrencyPicker";

describe("CurrencyPicker", () => {
  it("shows the current currency on a labelled trigger", () => {
    render(<CurrencyPicker value="PHP" onValueChange={vi.fn()} />);

    const trigger = screen.getByRole("button", {
      name: "Currency: Philippine Peso. Change currency",
    });
    expect(trigger).toHaveTextContent("₱PHP");
  });

  it("lets the user pick another currency and explains there's no conversion", async () => {
    const onValueChange = vi.fn();
    render(<CurrencyPicker value="PHP" onValueChange={onValueChange} />);

    fireEvent.click(screen.getByRole("button", { name: /^Currency:/ }));

    expect(
      await screen.findByText(
        "Changes how amounts are shown. Amounts aren't converted.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: /PHP/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );

    fireEvent.click(
      screen.getByRole("menuitemradio", { name: /Hungarian Forint/ }),
    );
    expect(onValueChange).toHaveBeenCalledWith("HUF");
  });
});
