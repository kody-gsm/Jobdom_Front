import assert from "node:assert/strict";
import { createConsultationApi } from "../../src/fsd/entities/consultation/api/createConsultationApi.ts";
import { validateConsultationDraft } from "../../src/fsd/entities/consultation/model/rules.ts";
import { submitConsultation } from "../../src/fsd/features/submit-consultation/api/consultation.ts";
import { forceCreateConsultation } from "../../src/fsd/pages/teacher/api/teacher.ts";

const calls: string[] = [];
const reservations = ["7교시", "8교시", "9교시"].map((period, index) => ({
  id: index + 1, reservation_id: index + 1, name: "학생", teacherId: 4,
  date: "2026-12-01", period, status: "WAITING" as const,
  state: "WAITING" as const, available: false,
}));
const api = createConsultationApi(async <T>(path: string) => {
  calls.push(path);
  return reservations as T;
});

for (const read of [api.getUpcoming, api.getAll, api.getTeacher, api.getPendingTeacher]) {
  assert.deepEqual((await read("common")).map(({ period }) => period), ["7교시"]);
  assert.deepEqual((await read("course")).map(({ period }) => period), ["7교시", "8교시", "9교시"]);
}
assert.deepEqual((await api.getTeacherSlotStatus("common", 4, "2026-12-01")).map(({ period }) => period), ["7교시"]);

const input = { title: "상담", content: "내용", category: "기타" as const, date: "2026-12-01", teacherId: 4 };
const callCount = calls.length;
for (const period of ["8교시", "9교시"]) {
  const draft = { ...input, type: "general" as const, teacher: "위클래스 선생님", period };
  assert.match(validateConsultationDraft(draft, false) ?? "", /위클래스.*8·9교시/);
  await assert.rejects(async () => api.create("common", { ...input, period }), /위클래스.*8·9교시/);
  await assert.rejects(async () => api.update("common", 1, { ...input, period }), /위클래스.*8·9교시/);
  await assert.rejects(async () => submitConsultation("common", { ...input, period }), /위클래스.*8·9교시/);
  await assert.rejects(async () => forceCreateConsultation("common", { ...input, studentId: 1, period }), /위클래스.*8·9교시/);
}
assert.equal(calls.length, callCount, "blocked reservations must not send a request");
await api.create("common", { ...input, period: "7교시" });
await api.create("course", { ...input, period: "8교시" });
assert.equal(calls.length, callCount + 2);
