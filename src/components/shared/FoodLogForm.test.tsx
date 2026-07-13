import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FoodLogForm } from "./FoodLogForm";

vi.mock("@/components/shared/AiFoodImageUpload", () => ({
  AiFoodImageUpload: ({ onRecognized }: { onRecognized: (food: unknown) => void }) => (
    <button
      type="button"
      onClick={() =>
        onRecognized({
          foodName: "苹果",
          servingDescription: "1 个",
          calories: 95,
          proteinG: 0.5,
          carbsG: 25,
          fatG: 0.3,
        })
      }
    >
      使用识别结果
    </button>
  ),
}));

vi.mock("@/components/shared/FoodSearch", () => ({
  FoodSearch: () => <div>食物搜索占位</div>,
}));

describe("FoodLogForm", () => {
  it("keeps selected items when submit fails", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error("网络错误"));

    render(<FoodLogForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "使用识别结果" }));
    expect(screen.getByText("苹果")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "批量保存 (1)" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("网络错误");
    expect(screen.getByText("苹果")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1 个")).toBeInTheDocument();
  });
});
