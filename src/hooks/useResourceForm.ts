"use client";

import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { toast } from "sonner";

// 工具型 Hook，不遵循统一数据请求签名

interface UseResourceFormOptions<TInput> {
  defaultValue: TInput;
  onSubmit: (data: TInput) => Promise<void>;
  successMessage?: string;
  errorMessage?: string;
}

interface UseResourceFormReturn<TInput> {
  values: TInput;
  setValues: Dispatch<SetStateAction<TInput>>;
  submitting: boolean;
  error: string | null;
  handleSubmit: () => Promise<boolean>;
  reset: () => void;
}

export function useResourceForm<TInput>({
  defaultValue,
  onSubmit,
  successMessage = "已保存",
  errorMessage = "保存失败",
}: UseResourceFormOptions<TInput>): UseResourceFormReturn<TInput> {
  const [values, setValues] = useState<TInput>(defaultValue);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setValues(defaultValue);
    setError(null);
  }, [defaultValue]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(values);
      toast.success(successMessage);
      return true;
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : errorMessage;
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [values, onSubmit, successMessage, errorMessage]);

  return { values, setValues, submitting, error, handleSubmit, reset };
}
