import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getUnavailablePeriods, isUnavailableSlotError } from "../../src/fsd/features/submit-consultation/model/slotAvailability.ts";

assert.deepEqual([...getUnavailablePeriods([
  { teacherId: 7, date: "2026-09-16", period: "2교시", state: "AUTO", available: true },
])], []);
assert.deepEqual([...getUnavailablePeriods([
  { teacherId: 7, date: "2026-09-16", period: "2교시", state: "AUTO", available: true },
  { teacherId: 7, date: "2026-09-16", period: "3교시", state: "LOCKED", available: false },
])], ["3교시"]);

// 선생님이 하루 또는 매주 반복으로 잠근 시간, 이미 찬 시간으로 거절되면 그 교시를 막는다. 문구가 바뀌어도 코드로 판단한다.
assert.equal(isUnavailableSlotError({ status: 423, code: "RESERVATION_LOCKED", message: "선생님이 매주 잠가 둔 시간입니다." }), true);
assert.equal(isUnavailableSlotError({ status: 423, code: "RESERVATION_LOCKED", message: "잠긴 날짜 입니다." }), true);
assert.equal(isUnavailableSlotError({ status: 409, code: "RESERVATION_CONFLICT", message: "누군가 예약한 시간입니다." }), true);
assert.equal(isUnavailableSlotError({ status: 409, code: "RESERVATION_CONFLICT", message: "같은 시간에 신청한 일반 상담이 있습니다." }), true);
assert.equal(isUnavailableSlotError({ status: 423, message: "다른 문구" }), true);
assert.equal(isUnavailableSlotError({ status: 400, message: "선생님이 매주 잠가 둔 시간입니다." }), true);
assert.equal(isUnavailableSlotError({ status: 400, code: "RESERVATION_BAD_REQUEST", message: "상담 내용을 입력해주세요." }), false);
assert.equal(isUnavailableSlotError({ status: 500, message: "서버 오류" }), false);

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const api = read("src/fsd/features/submit-consultation/api/consultation.ts");
const hook = read("src/fsd/features/submit-consultation/model/useConsultationAvailability.ts");

assert.match(api, /ConsultationSlotStatus/);
assert.match(api, /getConsultationSlotStatus/);
assert.match(api, /\/student\/\$\{kind\}\/status/);
assert.match(api, /teacherId/);
assert.match(api, /date/);
assert.match(api, /available:\s*boolean/);

assert.match(hook, /getConsultationSlotStatus/);
assert.match(hook, /toConsultationKind\(counselType\)/);
assert.match(hook, /selectedTeacher\.id/);
assert.doesNotMatch(hook, /selectedTeacherId|setSelectedTeacherId/);
assert.match(hook, /selectedDate/);
assert.doesNotMatch(hook, /serverAvailablePeriods/);
assert.match(hook, /serverUnavailablePeriods/);
assert.match(hook, /serverUnavailablePeriods\.has\(time\)/);
assert.match(hook, /setSelectedTime\(null\)/);

// 화면으로 돌아오면 선택을 지우지 않고 잠금 상태를 다시 확인하며, 그 사이 잠긴 교시만 선택에서 뺀다.
assert.match(hook, /refreshAvailabilityQuietly = useCallback/);
assert.match(hook, /\{ cache: "no-store" \}/);
assert.match(hook, /addEventListener\("visibilitychange", refreshWhenVisible\)/);
assert.match(hook, /removeEventListener\("visibilitychange", refreshWhenVisible\)/);
assert.match(hook, /current !== null && unavailable\.has\(current\) \? null : current/);
const form = read("src/fsd/features/submit-consultation/model/useConsultationForm.ts");
assert.match(form, /import \{ isUnavailableSlotError \} from "\.\/slotAvailability\.ts"/);
assert.match(form, /markUnavailableSlot\(teacherId, selectedDate, selectedTime\);\s*\/\/[^\n]*\n\s*refreshAvailabilityQuietly\(\);/);

console.log("student consultation slot status api contract passed");
