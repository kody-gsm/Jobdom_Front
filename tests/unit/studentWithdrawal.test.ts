import assert from "node:assert/strict";
import { test } from "node:test";
import { ApiError } from "../../src/fsd/shared/api/ApiError.ts";
import { createWithdrawAccountAction } from "../../src/fsd/features/withdraw-account/api/createWithdrawAccountAction.ts";

test("withdrawal sends the password and clears local account data only after server success", async () => {
  const calls: string[] = [];
  const withdraw = createWithdrawAccountAction({
    getSession: () => ({ accessToken: "token", refreshToken: "refresh" }),
    isAccessTokenStale: () => false,
    reissueSession: async () => { calls.push("reissue"); },
    request: async (path, init, options) => {
      assert.equal(path, "/auth/account");
      assert.equal(init.method, "DELETE");
      assert.deepEqual(JSON.parse(String(init.body)), { password: "secret" });
      assert.equal(options.accessToken, "token");
      calls.push("request");
    },
    clearSession: () => { calls.push("clearSession"); },
    clearRememberLoginPreference: () => { calls.push("clearPreference"); },
    clearProfileAvatar: () => { calls.push("clearAvatar"); },
  });

  await withdraw("secret");
  assert.deepEqual(calls, ["request", "clearAvatar", "clearSession", "clearPreference"]);
});

test("wrong password keeps the session and remembered data for retry", async () => {
  let cleared = false;
  const withdraw = createWithdrawAccountAction({
    getSession: () => ({ accessToken: "token", refreshToken: "refresh" }),
    isAccessTokenStale: () => false,
    reissueSession: async () => {},
    request: async () => { throw new ApiError("비밀번호가 올바르지 않습니다.", 401); },
    clearSession: () => { cleared = true; },
    clearRememberLoginPreference: () => { cleared = true; },
    clearProfileAvatar: () => { cleared = true; },
  });

  await assert.rejects(withdraw("wrong"), /비밀번호가 올바르지 않습니다/);
  assert.equal(cleared, false);
});
