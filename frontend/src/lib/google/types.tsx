export type GoogleCredentialResponse = {
  credential: string;
  select_by?: string;
  client_id?: string;
};

export type GooglePromptMomentNotification = {
  isDisplayMoment: () => boolean;
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  getNotDisplayedReason: () => string | null;
  isSkippedMoment: () => boolean;
  getSkippedReason: () => string | null;
  isDismissedMoment: () => boolean;
  getDismissedReason: () => string | null;
  getMomentType: () => string;
};

export type GoogleInitializeConfig = {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  scope?: string;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: "signin" | "signup" | "use";
  state_cookie_domain?: string;
  ux_mode?: "popup" | "redirect";
  itp_support?: boolean;
  use_fedcm_for_prompt?: boolean;
  intermediate_iframe_close_callback?: () => void;
  prompt_parent_id?: string;
  nonce?: string;
};

export type GoogleButtonOptions = {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "signin" | "continue_with" | "signup";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
  locale?: string;
  click_listener?: () => void;
};