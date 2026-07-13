import { toast } from "sonner";

interface ToastActionMessages {
  success: string;
  failure: string;
}

export async function runWithToast(
  action: () => Promise<void>,
  messages: ToastActionMessages,
): Promise<boolean> {
  try {
    await action();
    toast.success(messages.success);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : messages.failure;
    toast.error(message);
    return false;
  }
}
