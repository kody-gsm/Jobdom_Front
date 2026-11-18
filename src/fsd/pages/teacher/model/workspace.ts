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

export const getTeacherAvailablePeriods = (
  kind: ConsultationKind,
  name: string,
) => {
  const periods = CONSULTATION_SCHEDULE.map(({ period }) => period);
  if (kind === "common" || getTeacherWorkspaceVariant(name) === "general") {
    return periods.filter((period) => period !== "저녁시간");
  }
  return periods;
};
