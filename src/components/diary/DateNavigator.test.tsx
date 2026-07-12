import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DateNavigator } from "./DateNavigator";

describe("DateNavigator", () => {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  it("should show 'today' for today's date", () => {
    render(<DateNavigator date={today} onChange={vi.fn()} />);
    expect(screen.getByText("今天")).toBeInTheDocument();
  });

  it("should show 'yesterday' for yesterday's date", () => {
    render(<DateNavigator date={yesterday} onChange={vi.fn()} />);
    expect(screen.getByText("昨天")).toBeInTheDocument();
  });

  it("should disable forward button for today", () => {
    render(<DateNavigator date={today} onChange={vi.fn()} />);
    const forwardBtn = screen.getByLabelText("后一天");
    expect(forwardBtn).toBeDisabled();
  });

  it("should enable forward button for past date", () => {
    render(<DateNavigator date={yesterday} onChange={vi.fn()} />);
    const forwardBtn = screen.getByLabelText("后一天");
    expect(forwardBtn).not.toBeDisabled();
  });

  it("should show 'back to today' button for non-today date", () => {
    render(<DateNavigator date={yesterday} onChange={vi.fn()} />);
    expect(screen.getByText("回到今天")).toBeInTheDocument();
  });

  it("should call onChange when navigating back", async () => {
    const onChange = vi.fn();
    render(<DateNavigator date={today} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText("前一天"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("should call onChange with today when clicking 'back to today'", async () => {
    const onChange = vi.fn();
    render(<DateNavigator date={yesterday} onChange={onChange} />);
    await userEvent.click(screen.getByText("回到今天"));
    expect(onChange).toHaveBeenCalledWith(today);
  });
});
