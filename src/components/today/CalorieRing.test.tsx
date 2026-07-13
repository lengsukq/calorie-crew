import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CalorieRing } from "./CalorieRing";

describe("CalorieRing", () => {
  it("should render current and target values", () => {
    render(<CalorieRing current={1200} target={2000} />);
    expect(screen.getByText("1200")).toBeInTheDocument();
    expect(screen.getByText("/ 2000 kcal")).toBeInTheDocument();
  });

  it("should show remaining calories", () => {
    render(<CalorieRing current={1200} target={2000} />);
    expect(screen.getByText("剩余 800 kcal")).toBeInTheDocument();
  });

  it("should show exceeded calories when current exceeds target", () => {
    render(<CalorieRing current={2500} target={2000} />);
    expect(screen.getByText("超出 500 kcal")).toBeInTheDocument();
  });

  it("should render SVG element", () => {
    const { container } = render(<CalorieRing current={1000} target={2000} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelector("circle")).toBeInTheDocument();
  });
});
