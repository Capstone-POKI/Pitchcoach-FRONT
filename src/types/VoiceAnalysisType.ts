interface DetailScore {
  category: string;
  score: number;
}

interface DeliveryItem {
  category: string;
  feedback: string;
}

export interface GetVoiceAnalysisResponse {
  voice_id: string;
  pitch_id: string;
  analysis_status: string;
  version: number;
  audio_duration_display: string;
  wpm: number;
  total_score: number;
  structure_summary: string;
  overall_strengths: string[];
  overall_improvements: string[];
  detail_scores: DetailScore[];
  delivery_analysis: {
    speaking_speed: {
      metric_value: string;
      metric_label: string;
    };
    items: DeliveryItem[];
  };
  error_message?: string;
  analyzed_at: string;
}

export interface SlideTimestamp {
  slide_number: number;
  start_timestamp: number;
  end_timestamp: number;
}

export interface VoiceUploadResponse {
  voice_analysis_id: string;
  pitch_id: string;
  ir_deck_id: string;
  audio_file_url: string;
  audio_duration_seconds: number;
  audio_format: string;
  analysis_status: "IN_PROGRESS" | "COMPLETED" | "FAILED";
  version: number;
  is_latest: boolean;
  message: string;
}
