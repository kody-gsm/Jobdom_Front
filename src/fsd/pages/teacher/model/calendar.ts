import type { TeacherReservation } from "@fsd/entities/consultation";

export function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function getWeek(date: Date) {
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return Array.from({ length: 5 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return day;
  });
}

export function formatPeriod(period: string) {
  return /^\d+$/.test(period) ? `${period}교시` : period;
}

export function reservationSlot(item: Pick<TeacherReservation, "date" | "period">) {
  return `${item.date}_${formatPeriod(item.period)}`;
}
