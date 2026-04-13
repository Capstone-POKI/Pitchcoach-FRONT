export interface GetPitchesParams {
  status?: "IN_PROGRESS" | "COMPLETED";
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreatePitchRequest {
  title: string;
  pitch_type: "ELEVATOR" | "VC_DEMO" | "GOVERNMENT" | "COMPETITION";
  duration_minutes: number;
  notice_type: "PDF" | "MANUAL" | "NONE";
}

interface EvaluationCriteria {
  criteria_name: string;
  points: number;
  pitchcoach_interpretation: string;
  ir_guide: string;
}

export interface GetNoticeResponse {
  notice_id: string;
  pitch_id: string;
  analysis_status: "IN_PROGRESS" | "COMPLETED" | "FAILED";
  notice_name: string | null;
  host_organization: string | null;
  recruitment_type: string | null;
  target_audience: string | null;
  application_period: string | null;
  evaluation_criteria: EvaluationCriteria[];
  additional_criteria: any | null;
  ir_deck_guide: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateNoticeRequest {
  notice_name?: string;
  host_organization?: string;
  recruitment_type?: string;
  target_audience?: string;
  application_period?: string;
  evaluation_criteria?: {
    criteria_name: string;
    points: number;
  }[];
  additional_criteria?: string;
}

export interface DeckScore {
  total_score: number;
  structure_summary: string;
  strengths: string[];
  improvements: string[];
}

interface CriteriaScore {
  criteria_name: string;
  pitchcoach_interpretation: string;
  ir_guide: string;
  score: number;
  feedback: string;
}

interface PresentationGuide {
  emphasized_slides: {
    slide_number: number;
    reason: string;
  }[];
  guide: string[];
  time_allocation: string[];
}

export interface GetIrDeckResponse {
  ir_deck_id: string;
  pitch_id: string;
  analysis_status: "IN_PROGRESS" | "COMPLETED" | "FAILED";
  version: number;
  deck_score?: DeckScore;
  criteria_scores?: CriteriaScore[];
  presentation_guide?: PresentationGuide;
  error_message?: string;
  analyzed_at?: string;
}

interface SlideAnalysisItem {
  slide_number: number;
  category: string;
  score: number;
  thumbnail_url: string;
  content_summary: string;
  detailed_feedback: string;
  strengths: string[];
  improvements: string[];
  duration_display?: string;
}

export interface GetAnalysisSlidesResponse {
  ir_deck_id?: string;
  voice_id?: string;
  analysis_status: "IN_PROGRESS" | "COMPLETED" | "FAILED";
  total_slides?: number;
  slides?: SlideAnalysisItem[];
  error?: string;
  message?: string;
}
