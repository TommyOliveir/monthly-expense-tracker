// Minimal typings for the parts of Google Identity Services we use.
// Reference: https://developers.google.com/identity/gsi/web/reference/js-reference

export type GoogleCredentialResponse = {
  credential: string;
};

type GoogleIdConfiguration = {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  ux_mode?: "popup" | "redirect";
  context?: "signin" | "signup" | "use";
  auto_select?: boolean;
};

export type GoogleButtonText = "signin_with" | "signup_with" | "continue_with";

type GoogleButtonConfiguration = {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  shape?: "rectangular" | "pill" | "circle" | "square";
  text?: GoogleButtonText;
  logo_alignment?: "left" | "center";
  width?: number;
};

type GoogleAccountsId = {
  initialize: (config: GoogleIdConfiguration) => void;
  renderButton: (
    parent: HTMLElement,
    options: GoogleButtonConfiguration,
  ) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}
