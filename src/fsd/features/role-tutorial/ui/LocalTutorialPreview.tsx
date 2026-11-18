"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Tutorial } from "./Tutorial.tsx";
import { startPractice, stopPractice } from "../model/practiceSession.ts";

const PREVIEW_KEY = "jobdam-local-tutorial-preview";
const TOKEN_KEY = "jobdam_access_token";
const SESSION_KEY = "jobdam_session";
const PRACTICE_KEY = "local-student-tutorial-preview";

export const isLocalTutorialPreview = () =>
  process.env.NODE_ENV === "development" && (
    new URLSearchParams(window.location.search).get("tutorialPreview") === "1"
    || window.sessionStorage.getItem(PREVIEW_KEY) === "1"
  );

export const LocalTutorialPreview = ({ children }: { children: ReactNode }) => {
  const [ready, setReady] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    window.sessionStorage.setItem(PREVIEW_KEY, "1");
    const previousToken = window.sessionStorage.getItem(TOKEN_KEY);
    const previousSession = window.sessionStorage.getItem(SESSION_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, "local-tutorial-preview");
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      accessToken: "local-tutorial-preview", refreshToken: "", tokenType: "Bearer",
      userId: -1, email: "practice@example.invalid", name: "연습 학생", role: "STUDENT",
    }));
    let mounted = true;
    void startPractice(PRACTICE_KEY, { userId: -1, name: "연습 학생", role: "STUDENT" }).then(() => {
      if (mounted) {
        window.dispatchEvent(new Event("jobdam-session"));
        setReady(true);
      }
    });
    return () => {
      mounted = false;
      stopPractice();
      if (previousToken === null) window.sessionStorage.removeItem(TOKEN_KEY);
      else window.sessionStorage.setItem(TOKEN_KEY, previousToken);
      if (previousSession === null) window.sessionStorage.removeItem(SESSION_KEY);
      else window.sessionStorage.setItem(SESSION_KEY, previousSession);
      window.dispatchEvent(new Event("jobdam-session"));
    };
  }, []);

  if (!ready) return <p role="status" className="p-8">연습 화면 준비 중…</p>;

  return (
    <>
      {children}
      {finished ? null : <Tutorial role="STUDENT" mode="replay" onComplete={async () => setFinished(true)} />}
    </>
  );
};
