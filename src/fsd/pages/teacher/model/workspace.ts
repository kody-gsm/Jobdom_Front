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

// 위클래스 시간표는 7교시까지만 보여준다. 4교시는 학생 신청은 막지만 교사 시간표에는 남긴다.
const GENERAL_TEACHER_HIDDEN_PERIODS = new Set(["8교시", "9교시", "저녁시간"]);

export const getTeacherAvailablePeriods = (
  kind: ConsultationKind,
  name: string,
) => {
  const periods = CONSULTATION_SCHEDULE.map(({ period }) => period);
  if (kind === "common" || getTeacherWorkspaceVariant(name) === "general") {
    return periods.filter((period) => !GENERAL_TEACHER_HIDDEN_PERIODS.has(period));
  }
  return periods;
};
