"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@fsd/features/logout";
import { ContentCard } from "@fsd/shared/ui";

export const StudentAccountActions = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      router.replace("/login");
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
          className="min-h-12 rounded-xl border border-[#E9C8C5] px-5 text-sm font-bold text-[#B4443D] transition-colors hover:bg-[#FFF7F5]"
        >
          회원 탈퇴
        </button>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="student-withdrawal-title"
        aria-describedby="student-withdrawal-description"
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border-0 bg-white p-6 text-ink shadow-2xl backdrop:bg-black/40"
      >
        <h2 id="student-withdrawal-title" className="text-xl font-bold">회원 탈퇴</h2>
        <p id="student-withdrawal-description" className="mt-4 text-sm leading-6 text-[#667281]">
          현재 탈퇴 기능을 준비하고 있습니다. 서버 연동 전에는 탈퇴를 완료할 수 없습니다.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="min-h-11 rounded-xl border border-[#DDE2E7] px-5 text-sm font-bold hover:bg-surface"
          >
            닫기
          </button>
          <button
            type="button"
            disabled
            className="min-h-11 cursor-not-allowed rounded-xl bg-[#E9C8C5] px-5 text-sm font-bold text-white"
          >
            탈퇴 기능 준비 중
          </button>
        </div>
      </dialog>
    </ContentCard>
  );
};
