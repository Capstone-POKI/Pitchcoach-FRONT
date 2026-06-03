import { GenerateReportResponse, GetReportResponse } from "@/types/ReportType";
import {
  CreatePitchRequest,
  GetAnalysisSlidesResponse,
  GetIrDeckResponse,
  GetNoticeResponse,
  GetPitchesParams,
  UpdateNoticeRequest,
} from "@/types/PitchType";
import api from "./AxiosInstance";
import {
  GetVoiceAnalysisResponse,
  SlideTimestamp,
  VoiceUploadResponse,
} from "@/types/VoiceAnalysisType";
import {
  GetAnswerFeedbackResponse,
  GetQAListResponse,
  PostAnswerResponse,
  QAMode,
  UpdateQAModeResponse,
} from "@/types/QNAAnalysisType";
import axios from "axios";

export const GetPitches = async (params?: GetPitchesParams) => {
  const response = await api.get("/api/pitches", { params });
  return response.data;
};

export const PostPitch = async (data: CreatePitchRequest) => {
  const response = await api.post("/api/pitches", data);
  return response.data;
};

export const PostNoticeAnalyze = async (pitchId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    `/api/pitches/${pitchId}/notices/analyze`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

export const GetNoticeDetail = async (
  noticeId: string,
): Promise<GetNoticeResponse> => {
  const response = await api.get(`/api/notices/${noticeId}`);
  return response.data;
};

export const PatchNotice = async (
  noticeId: string,
  data: UpdateNoticeRequest,
) => {
  const response = await api.patch(`/api/notices/${noticeId}`, data);
  return response.data;
};

export const PostIrDeckAnalyze = async (pitchId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    `/api/pitches/${pitchId}/ir-decks/analyze`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

export const GetIrDeckDetail = async (
  deckId: string,
): Promise<GetIrDeckResponse> => {
  const response = await api.get(`/api/ir-decks/${deckId}`);
  return response.data;
};

export const GetVoiceAnalysisSlides = async (
  voiceId: string,
): Promise<GetAnalysisSlidesResponse> => {
  const response = await api.get(`/api/voice/${voiceId}/slides`);
  return response.data;
};

export const GetIrDeckSlides = async (
  deckId: string,
): Promise<GetAnalysisSlidesResponse> => {
  const response = await api.get(`/api/ir-decks/${deckId}/slides`);
  return response.data;
};

export const uploadAndAnalyzeVoice = async (
  pitchId: string,
  file: File | Blob,
  slideTimestamps: SlideTimestamp[],
): Promise<VoiceUploadResponse> => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("slide_timestamps", JSON.stringify(slideTimestamps));

  const response = await api.post<VoiceUploadResponse>(
    `/api/pitches/${pitchId}/voice/upload-and-analyze`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 0,
    },
  );

  return response.data;
};

export const getVoiceAnalysisDetail = async (
  voiceId: string,
): Promise<GetVoiceAnalysisResponse> => {
  const response = await api.get<GetVoiceAnalysisResponse>(
    `/api/voice/${voiceId}`,
  );
  return response.data;
};

export const updatePitchQAMode = async (
  pitchId: string,
  qaMode: QAMode,
  forceRegenerate: boolean = false,
): Promise<UpdateQAModeResponse | null> => {
  try {
    const response = await api.patch<UpdateQAModeResponse>(
      `/api/pitches/${pitchId}/qa-mode`,
      { qa_mode: qaMode, force_regenerate: forceRegenerate },
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      const serverMessage = error.response?.data?.message;
      alert(serverMessage || "음성 분석이 완료된 후 시도해 주세요.");
      return null;
    }
    throw error;
  }
};

export const getPitchQuestions = async (
  pitchId: string,
  regenerateGuides: boolean = false,
): Promise<GetQAListResponse> => {
  const response = await api.get<GetQAListResponse>(
    `/api/pitches/${pitchId}/questions`,
    {
      params: {
        regenerate_guides: regenerateGuides,
      },
    },
  );
  return response.data;
};

export const getAnswerFeedback = async (
  answerId: string,
): Promise<GetAnswerFeedbackResponse> => {
  const response = await api.get<GetAnswerFeedbackResponse>(
    `/api/answers/${answerId}`,
  );
  return response.data;
};

export const generateReport = async (
  pitchId: string,
): Promise<GenerateReportResponse> => {
  const response = await api.post<GenerateReportResponse>(
    `/api/pitches/${pitchId}/report`,
    {},
  );
  return response.data;
};

export const getReport = async (
  reportId: string,
): Promise<GetReportResponse> => {
  const response = await api.get<GetReportResponse>(`/api/reports/${reportId}`);
  return response.data;
};

export const postQuestionAnswer = async (
  questionId: string,
  audioBlob: Blob,
): Promise<PostAnswerResponse> => {
  const formData = new FormData();
  formData.append("file", audioBlob, "answer.webm");

  const response = await api.post<PostAnswerResponse>(
    `/api/questions/${questionId}/answers`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
};
