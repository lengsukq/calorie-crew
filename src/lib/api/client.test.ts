import { describe, expect, it, vi } from "vitest";
import { apiFetch, ApiError, todayDate } from "./client";

describe("todayDate", () => {
  it("should return date in YYYY-MM-DD format", () => {
    const date = todayDate();
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("ApiError", () => {
  it("should create an error with status and message", () => {
    const error = new ApiError("Not found", 404);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Not found");
    expect(error.status).toBe(404);
    expect(error.name).toBe("ApiError");
  });
});

describe("apiFetch", () => {
  const baseUrl = "http://localhost:9001";

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return JSON on successful response", async () => {
    const mockData = { logs: [] };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response);

    const result = await apiFetch(`${baseUrl}/api/test`);
    expect(result).toEqual(mockData);
  });

  it("should throw ApiError on failed response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: "参数错误" }),
    } as Response);

    const promise = apiFetch(`${baseUrl}/api/test`);
    await expect(promise).rejects.toThrow(ApiError);
    await expect(promise).rejects.toThrow("参数错误");
  });

  it("should throw ApiError with fallback message when no error body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("parse error")),
    } as Response);

    const promise = apiFetch(`${baseUrl}/api/test`);
    await expect(promise).rejects.toThrow(ApiError);
    await expect(promise).rejects.toThrow("请求失败 (500)");
  });

  it("should include content-type header by default", async () => {
    const mockData = { success: true };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response);

    await apiFetch(`${baseUrl}/api/test`);
    expect(fetchSpy).toHaveBeenCalledWith(`${baseUrl}/api/test`, {
      headers: { "content-type": "application/json" },
    });
  });

  it("should merge custom headers", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    await apiFetch(`${baseUrl}/api/test`, {
      headers: { Authorization: "Bearer token" },
    });

    expect(fetchSpy).toHaveBeenCalledWith(`${baseUrl}/api/test`, {
      headers: {
        "content-type": "application/json",
        Authorization: "Bearer token",
      },
    });
  });
});
