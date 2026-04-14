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

export interface QAQuestion {
  question_id: string;
  category:
    | "PROBLEM"
    | "SOLUTION"
    | "MARKET_BIZ"
    | "PERFORMANCE"
    | "TEAM"
    | "FUNDING"
    | "JUDGE_TYPE";
  display_order: number;
  question: string;
  answer_guide: string;
  has_answer: boolean;
}

export interface GetQAListResponse {
  pitch_id: string;
  qa_training: {
    qa_training_id: string;
    mode: "GUIDE_ONLY" | "REALTIME";
    total_questions: number;
    version: number;
    is_latest: boolean;
  };
  questions: QAQuestion[];
  updated_at: string;
}
