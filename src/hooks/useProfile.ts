"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchProfile, saveProfile } from "@/lib/api/profile";
import type { ProfileResponseData, UserProfileFormData } from "@/shared/types";

interface UseProfileReturn {
  data: ProfileResponseData | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  reload: () => Promise<void>;
  updateProfile: (data: UserProfileFormData) => Promise<ProfileResponseData>;
}

export function useProfile(): UseProfileReturn {
  const [data, setData] = useState<ProfileResponseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profileResponse = await fetchProfile();
      setData(profileResponse);
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载个人档案失败";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateProfile = useCallback(async (formData: UserProfileFormData) => {
    setSaving(true);
    setError(null);
    try {
      const profileResponse = await saveProfile(formData);
      setData(profileResponse);
      return profileResponse;
    } catch (err) {
      const message = err instanceof Error ? err.message : "保存个人档案失败";
      setError(message);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  }, []);

  return { data, loading, saving, error, reload: load, updateProfile };
}
