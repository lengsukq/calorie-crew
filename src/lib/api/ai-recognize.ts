import { apiFetch } from "@/lib/api/client";

export interface RecognizedFood {
  foodName: string;
  servingDescription: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface RecognizeFoodResponse {
  foods: RecognizedFood[];
}

interface RecognizeFoodInput {
  imageData?: string;
  mimeType?: string;
  description?: string;
}

export function recognizeFood(imageBase64: string): Promise<RecognizeFoodResponse> {
  const body: RecognizeFoodInput = { imageData: imageBase64 };
  return apiFetch<RecognizeFoodResponse>("/api/ai/recognize", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
