export type QAMode = "REALTIME" | "GUIDE_ONLY";

export interface QATrainingInfo {
  qa_training_id: string;
  notice_id: string;
  ir_deck_id: string;
  voice_analysis_id: string;
  mode: QAMode;
  total_questions: number;
  version: number;
  is_latest: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateQAModeResponse {
  pitch_id: string;
  qa_training: QATrainingInfo;
  next: {
    action: string;
    questions_api: string;
  };
}
