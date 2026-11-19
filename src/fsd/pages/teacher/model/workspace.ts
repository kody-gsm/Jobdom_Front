import {
  CONSULTATION_SCHEDULE,
  type ConsultationKind,
} from "../../../entities/consultation/index.ts";
import type { UserRole } from "../../../entities/user/index.ts";

export const getTeacherConsultationKinds = (
  role: UserRole | null,
): ConsultationKind[] => {
  if (role === "TEACHER") return ["course"];
  if (role === "WEE_TEACHER") return ["common"];
  return [];
};

export type TeacherWorkspaceVariant =
  | "im-gyeongwon"
  | "kim-gwon-yeso"
  | "jeong-yungi"
  | "general";

const normalizeTeacherName = (name: string) => name.replace(/ 선생님$/, "").trim();

export const getTeacherWorkspaceVariant = (
  name: string,
): TeacherWorkspaceVariant => {
  const normalized = normalizeTeacherName(name);
  if (normalized === "임경원") return "im-gyeongwon";
  if (normalized === "김권예소") return "kim-gwon-yeso";
  if (normalized === "정윤기") return "jeong-yungi";
  return "general";
};

export const canManageHomeBanner = (role: UserRole | null) =>
  role === "TEACHER" || role === "WEE_TEACHER";

const GENERAL_TEACHER_LATE_PERIODS = new Set(["8교시", "9교시"]);

/**
 * 위클래스 시간표는 7교시까지만 보여준다. 학생은 위클래스 8·9교시도 신청할 수 있으므로(#226)
 * 보고 있는 주에 그 교시 신청이 있으면 시간표에서 빠지지 않도록 그 교시만 남긴다.
 */
export const getTeacherAvailablePeriods = (
  kind: ConsultationKind,
  name: string,
  bookedPeriods: ReadonlySet<string> = new Set(),
) => {
  const periods = CONSULTATION_SCHEDULE.map(({ period }) => period);
  if (kind === "common" || getTeacherWorkspaceVariant(name) === "general") {
    return periods.filter((period) =>
      period !== "저녁시간" && (!GENERAL_TEACHER_LATE_PERIODS.has(period) || bookedPeriods.has(period)));
  }
  return periods;
};
