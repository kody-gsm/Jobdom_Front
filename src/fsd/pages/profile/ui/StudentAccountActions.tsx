"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@fsd/features/logout";
import { withdrawAccount } from "@fsd/features/withdraw-account";
import { ApiError } from "@fsd/shared/api";
import { ContentCard } from "@fsd/shared/ui";

export const StudentAccountActions = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const withdrawalPendingRef = useRef(false);
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [password, setPassword] = useState("");
  const [withdrawalError, setWithdrawalError] = useState("");

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      router.replace("/login");
    }
  };

  const closeWithdrawal = () => {
    if (isWithdrawing) return;
    dialogRef.current?.close();
    setPassword("");
    setWithdrawalError("");
  };

  const handleWithdrawal = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (withdrawalPendingRef.current || !password) return;
    withdrawalPendingRef.current = true;
    setIsWithdrawing(true);
    setWithdrawalError("");
    try {
      await withdrawAccount(password);
      router.replace("/login");
    } catch (error) {
      setWithdrawalError(error instanceof ApiError ? error.message : "탈퇴 요청에 실패했습니다. 다시 시도해주세요.");
    } finally {
      withdrawalPendingRef.current = false;
      setIsWithdrawing(false);
    }
  };

  return (
    <ContentCard className="p-8">
      <h2 className="text-lg font-bold text-ink">계정 관리</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={isLoggingOut}
          className="min-h-12 rounded-xl border border-[#DDE2E7] px-5 text-sm font-bold text-ink transition-colors hover:bg-surface disabled:cursor-wait disabled:opacity-60"
        >
          {isLoggingOut ? "로그아웃 중…" : "로그아웃"}
        </button>
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          disabled={isLoggingOut}
          className="min-h-12 rounded-xl border border-[#E9C8C5] px-5 text-sm font-bold text-[#B4443D] transition-colors hover:bg-[#FFF7F5]"
        >
          회원 탈퇴
        </button>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="student-withdrawal-title"
        aria-describedby="student-withdrawal-description"
        onCancel={(event) => {
          if (isWithdrawing) event.preventDefault();
          else closeWithdrawal();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border-0 bg-white p-6 text-ink shadow-2xl backdrop:bg-black/40"
      >
        <form onSubmit={(event) => void handleWithdrawal(event)}>
          <h2 id="student-withdrawal-title" className="text-xl font-bold">회원 탈퇴</h2>
          <p id="student-withdrawal-description" className="mt-4 text-sm leading-6 text-[#667281]">
            탈퇴하면 가입 정보와 프로필 사진이 초기화됩니다. 학교에 등록된 학생 기본 정보와 기존 상담 기록은 유지됩니다.
          </p>
          <label htmlFor="withdrawal-password" className="mt-5 block text-sm font-bold">비밀번호 확인</label>
          <input
            id="withdrawal-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isWithdrawing}
            className="mt-2 min-h-11 w-full rounded-xl border border-[#DDE2E7] px-4 outline-none focus:border-brand-accent"
          />
          {withdrawalError ? <p role="alert" className="mt-3 text-sm text-[#B4443D]">{withdrawalError}</p> : null}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeWithdrawal}
              disabled={isWithdrawing}
              className="min-h-11 rounded-xl border border-[#DDE2E7] px-5 text-sm font-bold hover:bg-surface disabled:opacity-60"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isWithdrawing || !password}
              className="min-h-11 rounded-xl bg-[#B4443D] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isWithdrawing ? "탈퇴 처리 중…" : "회원 탈퇴"}
            </button>
          </div>
        </form>
      </dialog>
    </ContentCard>
  );
};
