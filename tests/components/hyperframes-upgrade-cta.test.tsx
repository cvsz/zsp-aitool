import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HyperFramesPage from "@/app/dashboard/hyperframes/page";

describe("HyperFrames upgrade CTA", () => {
  it("shows upgrade CTA when render API returns UPGRADE_REQUIRED", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ json: async () => ({ data: [{ id: "p1", title: "Product" }] }) })
      .mockResolvedValueOnce({ json: async () => ({ ok: false, error: { code: "UPGRADE_REQUIRED", message: "Upgrade required" } }) });
    vi.stubGlobal("fetch", fetchMock as never);

    render(<HyperFramesPage />);
    await waitFor(() => expect(screen.getByText("Product")).toBeInTheDocument());
    fireEvent.change(screen.getByDisplayValue("เลือกสินค้า"), { target: { value: "p1" } });
    fireEvent.click(screen.getByText("Render"));

    await waitFor(() => expect(screen.getByText(/อัปเกรดแพ็กเกจ/)).toBeInTheDocument());
  });
});
