import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DateNavigator } from "./DateNavigator";
import { addDays, todayDate } from "@/lib/date";

describe("DateNavigator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 13, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function currentToday(): string {
    return todayDate();
  }

  function currentYesterday(): string {
    return addDays(todayDate(), -1);
  }

  it("should show 'today' for today's date", () => {
    render(<DateNavigator date={currentToday()} onChange={vi.fn()} />);
    expect(screen.getByText("今天")).toBeInTheDocument();
  });

  it("should show 'yesterday' for yesterday's date", () => {
    render(<DateNavigator date={currentYesterday()} onChange={vi.fn()} />);
    expect(screen.getByText("昨天")).toBeInTheDocument();
  });

  it("should disable forward button for today", () => {
    render(<DateNavigator date={currentToday()} onChange={vi.fn()} />);
    const forwardBtn = screen.getByLabelText("后一天");
    expect(forwardBtn).toBeDisabled();
  });

  it("should enable forward button for past date", () => {
    render(<DateNavigator date={currentYesterday()} onChange={vi.fn()} />);
    const forwardBtn = screen.getByLabelText("后一天");
    expect(forwardBtn).not.toBeDisabled();
  });

  it("should show 'back to today' button for non-today date", () => {
    render(<DateNavigator date={currentYesterday()} onChange={vi.fn()} />);
    expect(screen.getByText("回到今天")).toBeInTheDocument();
  });

  it("should call onChange when navigating back", async () => {
    const onChange = vi.fn();
    render(<DateNavigator date={currentToday()} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("前一天"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("should call onChange with today when clicking 'back to today'", async () => {
    const onChange = vi.fn();
    render(<DateNavigator date={currentYesterday()} onChange={onChange} />);
    fireEvent.click(screen.getByText("回到今天"));
    expect(onChange).toHaveBeenCalledWith(currentToday());
  });
});
