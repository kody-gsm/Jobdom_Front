type TeacherIdentity = { name: string; email?: string };
type ClassScheduleEntry = { label: string; subtitle?: string };

const WEEKLY_CLASS_SCHEDULE: Record<string, Record<string, ClassScheduleEntry>> = {
  월: {
    "1교시": { label: "예약 불가" },
    "2교시": { label: "예약 불가" },
    "3교시": { label: "2-4", subtitle: "수업 · 예약 불가" },
    "4교시": { label: "예약 불가" },
    "7교시": { label: "예약 불가" },
  },
  화: {
    "1교시": { label: "3-1", subtitle: "수업 · 예약 불가" },
    "2교시": { label: "2-3", subtitle: "수업 · 예약 불가" },
    "4교시": { label: "예약 불가" },
    "6교시": { label: "예약 불가" },
    "7교시": { label: "예약 불가" },
  },
  수: {
    "1교시": { label: "3-4", subtitle: "수업 · 예약 불가" },
    "4교시": { label: "3-3", subtitle: "수업 · 예약 불가" },
    "5교시": { label: "창체", subtitle: "예약 불가" },
    "6교시": { label: "창체", subtitle: "예약 불가" },
    "7교시": { label: "전공", subtitle: "예약 불가" },
  },
  목: {
    "3교시": { label: "예약 불가" },
    "4교시": { label: "2-1", subtitle: "수업 · 예약 불가" },
    "5교시": { label: "2-2", subtitle: "수업 · 예약 불가" },
    "6교시": { label: "예약 불가" },
    "7교시": { label: "예약 불가" },
  },
  금: {
    "1교시": { label: "3-2", subtitle: "수업 · 예약 불가" },
    "4교시": { label: "예약 불가" },
    "7교시": { label: "3-3", subtitle: "수업 · 예약 불가" },
  },
};

export const getTeacherClassScheduleEntry = (
  teacher: TeacherIdentity | null,
  date: string | null,
  period: string,
) => {
  if (!teacher || !date) return undefined;
  // shortcut: 학생 교사 목록에는 이메일이 없어 이미지의 이름으로 매칭한다. 이메일 응답이 추가되면 이메일만 사용한다.
  const isTarget = teacher.email !== undefined
    ? teacher.email.trim().toLowerCase() === "jfhl1973@daum.net"
    : teacher.name.trim().replace(/ 선생님$/, "") === "임경원";
  if (!isTarget) return undefined;
  const day = ["일", "월", "화", "수", "목", "금", "토"][new Date(`${date}T00:00:00Z`).getUTCDay()];
  return day ? WEEKLY_CLASS_SCHEDULE[day]?.[period] : undefined;
};
