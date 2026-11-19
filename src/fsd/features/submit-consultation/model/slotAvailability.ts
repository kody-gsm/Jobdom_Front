import type { ConsultationSlotStatus } from "../api/consultation.ts";

export const getUnavailablePeriods = (
  items: readonly ConsultationSlotStatus[],
) => new Set(items.filter((item) => item.available === false).map((item) => item.period));

// 서버는 선생님이 잠근 시간(하루·매주 반복)을 423 RESERVATION_LOCKED로, 이미 찬 시간을 409 RESERVATION_CONFLICT로 거절한다.
const UNAVAILABLE_SLOT_CODES = new Set(["RESERVATION_LOCKED", "RESERVATION_CONFLICT"]);
const UNAVAILABLE_SLOT_MESSAGE = /예약한 시간|누군가 예약|이미 예약|잠긴 날짜|잠긴 시간|잠가 둔 시간/;

/** 신청이 그 시간 자체 때문에 거절되었는지 판단한다. 메시지 문구가 바뀌어도 코드로 먼저 확인한다. */
export const isUnavailableSlotError = (error: { status: number; code?: string; message: string }) =>
  (error.code !== undefined && UNAVAILABLE_SLOT_CODES.has(error.code))
  || error.status === 423
  || UNAVAILABLE_SLOT_MESSAGE.test(error.message);
