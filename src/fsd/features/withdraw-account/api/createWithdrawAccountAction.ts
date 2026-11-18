import { ApiError } from "@fsd/shared/api";

type Session = { accessToken: string; refreshToken?: string | null };

interface WithdrawalDependencies {
  getSession: () => Session | null;
  isAccessTokenStale: (token: string) => boolean;
  reissueSession: (refreshToken: string) => Promise<void>;
  request: (
    path: string,
    init: RequestInit,
    options: { accessToken: string },
  ) => Promise<unknown>;
  clearProfileAvatar: () => void;
  clearSession: () => void;
  clearRememberLoginPreference: () => void;
}

export const createWithdrawAccountAction = ({
  getSession,
  isAccessTokenStale,
  reissueSession,
  request,
  clearProfileAvatar,
  clearSession,
  clearRememberLoginPreference,
}: WithdrawalDependencies) => async (password: string) => {
  let session = getSession();
  if (!session) throw new ApiError("로그인이 필요합니다.", 401);

  // 비밀번호 오류도 401이다. 공통 인증 요청의 401 자동 로그아웃을 사용하지 않는다.
  if (session.refreshToken && isAccessTokenStale(session.accessToken)) {
    await reissueSession(session.refreshToken);
    session = getSession();
    if (!session) throw new ApiError("로그인이 필요합니다.", 401);
  }

  await request("/auth/account", {
    method: "DELETE",
    body: JSON.stringify({ password }),
  }, { accessToken: session.accessToken });

  clearProfileAvatar();
  clearSession();
  clearRememberLoginPreference();
};
