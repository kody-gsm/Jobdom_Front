import {
  clearRememberLoginPreference,
  clearSession,
  getProfileAvatarUserKey,
  getSession,
  isAccessTokenStale,
  reissueSession,
  saveProfileAvatar,
} from "@fsd/entities/user";
import { request } from "@fsd/shared/api";
import { createWithdrawAccountAction } from "./createWithdrawAccountAction.ts";

export const withdrawAccount = (password: string) =>
  createWithdrawAccountAction({
    getSession,
    isAccessTokenStale,
    reissueSession,
    request,
    clearProfileAvatar: () => {
      const session = getSession();
      if (session) {
        saveProfileAvatar(getProfileAvatarUserKey({
          email: session.email,
          studentId: session.userId?.toString(),
          name: session.name,
        }), "");
      }
    },
    clearSession,
    clearRememberLoginPreference,
  })(password);
