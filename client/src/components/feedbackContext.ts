// client/src/components/feedbackContext.ts
// Context and hooks for toasts and confirm dialogs (provider: Feedback.tsx).
import { createContext, useContext } from "react";

export type ToastKind = "success" | "error" | "info";

export interface ConfirmOptions {
  title?: string;
  confirmLabel?: string;
  danger?: boolean;
}

interface FeedbackApi {
  toast: (message: string, kind?: ToastKind) => void;
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
}

const fallback: FeedbackApi = {
  toast: (message) => window.alert(message),
  confirm: async (message) => window.confirm(message)
};

export const FeedbackContext = createContext<FeedbackApi>(fallback);

export function useToast() {
  return useContext(FeedbackContext).toast;
}

export function useConfirm() {
  return useContext(FeedbackContext).confirm;
}
