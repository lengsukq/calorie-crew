import { describe, expect, it, vi } from "vitest";
import { deleteFoodLog, updateFoodLog } from "./food-logs";
import type { FoodLogFormData } from "@/shared/types";

describe("food log API client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sends PATCH payload when updating a food log", async () => {
    const updateData: FoodLogFormData = {
      mealType: "lunch",
      foodName: "鸡胸肉",
      servingDescription: "150g",
      calories: 248,
      proteinG: 46,
      carbsG: 0,
      fatG: 5.4,
    };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ log: { id: "log-1", ...updateData } }),
    } as Response);

    await updateFoodLog("log-1", "2026-07-13", updateData);

    expect(fetchSpy).toHaveBeenCalledWith("/api/food-logs/log-1", {
      method: "PATCH",
      body: JSON.stringify({ logDate: "2026-07-13", ...updateData }),
      headers: { "content-type": "application/json" },
    });
  });

  it("throws backend error messages when delete fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: "饮食记录不存在" }),
    } as Response);

    await expect(deleteFoodLog("missing-log")).rejects.toThrow("饮食记录不存在");
  });
});
