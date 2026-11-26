import assert from "node:assert/strict";
import { getTeacherClassScheduleEntry } from "../../src/fsd/entities/consultation/model/teacherClassSchedule.ts";

const target = { name: "임경원", email: "jfhl1973@daum.net" };
const blocked = [[1, 2, 3, 4, 7], [1, 2, 4, 6, 7], [1, 4, 5, 6, 7], [3, 4, 5, 6, 7], [1, 4, 7]];
let total = 0;
for (const [index, periods] of blocked.entries()) {
  const date = `2026-11-0${index + 2}`;
  for (let period = 1; period <= 7; period++) {
    const label = `${period}교시`;
    const expected = periods.includes(period);
    assert.equal(Boolean(getTeacherClassScheduleEntry(target, date, label)), expected);
    assert.equal(Boolean(getTeacherClassScheduleEntry({ name: "임경원 선생님" }, date, label)), expected);
    assert.equal(getTeacherClassScheduleEntry({ ...target, email: "other@example.com" }, date, label), undefined);
    assert.equal(getTeacherClassScheduleEntry({ name: "김권예소" }, date, label), undefined);
    if (expected) total++;
  }
}
assert.equal(total, 23);
assert.equal(getTeacherClassScheduleEntry(target, "2026-12-01", "1교시")?.label, "3-1");
assert.equal(getTeacherClassScheduleEntry(target, "2026-11-04", "4교시")?.label, "3-3");
assert.equal(getTeacherClassScheduleEntry(target, "2026-11-02", "1교시")?.label, "예약 불가");
assert.equal(getTeacherClassScheduleEntry(target, "2026-11-07", "1교시"), undefined);
assert.equal(getTeacherClassScheduleEntry(target, "2026-11-02", "점심시간"), undefined);
assert.equal(getTeacherClassScheduleEntry(target, "invalid", "1교시"), undefined);

await import("./api-contract.test.ts");
const { persistSession } = await import("../../src/fsd/entities/user/model/session.ts");
const { forceCreateConsultation } = await import("../../src/fsd/pages/teacher/api/teacher.ts");
const session = { ...target, role: "TEACHER" as const, userId: 3, accessToken: "class-test-token", refreshToken: "refresh", tokenType: "Bearer" };
persistSession(session, false);
let requests = 0;
globalThis.fetch = (async () => {
  requests++;
  return new Response(JSON.stringify("ok"), { headers: { "Content-Type": "application/json" } });
}) as typeof fetch;
const input = { studentId: 1, title: "상담", content: "내용", category: "취업" as const, date: "2026-11-02", period: "1교시" };
await assert.rejects(forceCreateConsultation("course", input), /수업 시간/);
assert.equal(requests, 0, "a blue cell must not send a teacher force-reservation request");
await forceCreateConsultation("course", { ...input, period: "5교시" });
persistSession({ ...session, email: "other@example.com" }, false);
await forceCreateConsultation("course", input);
assert.equal(requests, 2, "white cells and other teacher accounts keep their existing requests");
