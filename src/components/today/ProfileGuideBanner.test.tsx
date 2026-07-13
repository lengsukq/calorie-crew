import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

vi.mock("@/hooks/useProfile", () => ({
  useProfile: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mockUseProfile = vi.mocked(await import("@/hooks/useProfile")).useProfile;
const { ProfileGuideBanner } = await import("./ProfileGuideBanner");

function setProfileResponse(overrides: {
  percentage?: number;
  missingFields?: string[];
  loading?: boolean;
}) {
  const missingFields = overrides.missingFields ?? [];
  const completedFields = [
    "displayName",
    "birthDate",
    "gender",
    "heightCm",
    "activityLevel",
    "healthGoal",
    "weightTargetKg",
  ].filter((field) => !missingFields.includes(field));

  mockUseProfile.mockReturnValue({
    data: {
      profile: {
        displayName: missingFields.includes("displayName") ? null : "张三",
        birthDate: missingFields.includes("birthDate") ? null : "1995-06-15",
        gender: "male",
        heightCm: missingFields.includes("heightCm") ? null : 175,
        activityLevel: "moderate",
        healthGoal: "lose_weight",
        weightTargetKg: missingFields.includes("weightTargetKg") ? null : "65.00",
        aiAdviceEnabled: true,
        aiAdviceFrequency: "daily",
      },
      metrics: {
        age: 30,
        currentWeightKg: "70.00",
        bmi: 22.9,
        bmr: 1650,
        tdee: 2557,
        suggestedIntake: { min: 1918, max: 2176 },
        bmiCategory: "正常",
        bmiCategoryColor: "green",
      },
      profileCompleteness: {
        completedFields,
        missingFields,
        percentage: overrides.percentage ?? Math.round((completedFields.length / 7) * 100),
      },
    },
    loading: overrides.loading ?? false,
    saving: false,
    error: null,
    reload: vi.fn(),
    updateProfile: vi.fn(),
  });
}

describe("ProfileGuideBanner", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 13, 12, 0, 0));
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
    vi.clearAllMocks();
  });

  it("does not render when profile is 100% complete", () => {
    setProfileResponse({ percentage: 100, missingFields: [] });
    const { container } = render(<ProfileGuideBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("does not render when loading", () => {
    setProfileResponse({ percentage: 0, missingFields: ["heightCm"], loading: true });
    const { container } = render(<ProfileGuideBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("does not render when missing fields are not critical (no heightCm/birthDate/gender)", () => {
    setProfileResponse({
      percentage: 71,
      missingFields: ["displayName", "weightTargetKg"],
    });
    const { container } = render(<ProfileGuideBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("renders banner when heightCm is missing", () => {
    setProfileResponse({ percentage: 71, missingFields: ["heightCm"] });
    render(<ProfileGuideBanner />);
    expect(screen.getByText("完善个人档案")).toBeInTheDocument();
    expect(screen.getByText("立即填写")).toBeInTheDocument();
    expect(screen.getByText("稍后提醒")).toBeInTheDocument();
  });

  it("hides banner for 24 hours after clicking remind later", () => {
    setProfileResponse({ percentage: 71, missingFields: ["heightCm"] });
    const { container } = render(<ProfileGuideBanner />);
    expect(screen.getByText("完善个人档案")).toBeInTheDocument();

    fireEvent.click(screen.getByText("稍后提醒"));
    expect(container.firstChild).toBeNull();

    const stored = window.localStorage.getItem("calorie_crew_profile_remind_later");
    expect(stored).not.toBeNull();
  });

  it("does not show banner within 24 hours of remind later", () => {
    const twentyThreeHoursLater = Date.now() + 23 * 60 * 60 * 1000;
    vi.setSystemTime(twentyThreeHoursLater);
    window.localStorage.setItem(
      "calorie_crew_profile_remind_later",
      String(Date.now()),
    );
    vi.setSystemTime(new Date(2026, 6, 13, 12, 0, 0));

    setProfileResponse({ percentage: 71, missingFields: ["heightCm"] });
    const { container } = render(<ProfileGuideBanner />);
    expect(container.firstChild).toBeNull();
  });
});
