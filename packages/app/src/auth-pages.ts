// @ts-nocheck
import { define } from "@unbndl/html";
import { Auth } from "@unbndl/auth";
import { HeaderElement } from "./components/blz-header.ts";
import { LoginFormElement } from "./components/login-form.ts";

define({
  "auth-provider": Auth.Provider,
  "ff-header": HeaderElement,
  "login-form": LoginFormElement
});
