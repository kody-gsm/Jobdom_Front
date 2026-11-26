import { assertWeePeriodAllowed, createConsultationApi, getTeacherClassScheduleEntry } from "@fsd/entities/consultation";
import type { ConsultationKind, CounselingCategory, TeacherSlotStatus } from "@fsd/entities/consultation";
import { createBannerApi } from "@fsd/entities/banner";
import { getSession, requestWithSession } from "@fsd/entities/user";

const consultationApi = createConsultationApi(requestWithSession);
const bannerApi = createBannerApi(requestWithSession);

export const getTeacherConsultations = consultationApi.getTeacher;
export const getPendingTeacherConsultations = consultationApi.getPendingTeacher;
export const approveConsultation = consultationApi.approve;
export const rejectConsultation = consultationApi.reject;
export const lockConsultation = consultationApi.lock;
export const unlockConsultation = consultationApi.unlock;
export const getTeacherSlotStatus = consultationApi.getTeacherSlotStatus;
export type { TeacherSlotStatus };

export type SimpleStudent = {
    id: number;
    name: string;
    student_number: string;
};

export const getTeacherStudents = () =>
    requestWithSession<SimpleStudent[]>("/teacher/students");
export const getTeacherBanner = bannerApi.getTeacher;
export const saveTeacherBanner = bannerApi.saveTeacher;

export type ForceReservationInput = {
    studentId: number;
    title: string;
    content: string;
    category: CounselingCategory;
    date: string;
    period: string;
};

export const forceCreateConsultation = async (kind: ConsultationKind, input: ForceReservationInput) => {
    assertWeePeriodAllowed(kind, input.period);
    if (getTeacherClassScheduleEntry(getSession(), input.date, input.period)) {
        throw new Error("수업 시간에는 상담을 추가 신청할 수 없습니다.");
    }
    return requestWithSession<string>(`/teacher/${kind}/force`, {
        method: "POST",
        body: JSON.stringify(input),
        invalidateCache: [`/student/${kind}`, `/teacher/${kind}`],
    });
};

export { getSession };
