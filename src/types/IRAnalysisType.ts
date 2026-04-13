export interface FeedbackData {
  total_score: number;
  structure_summary: string;
  strengths: string[];
  improvements: string[];
}
export interface Slide {
  slide_number: number;
  category: string;
  score: number;
  thumbnail_url: string;
  duration_display?: string;
  content_summary: string;
  detailed_feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface SlideAnalysisData {
  ir_deck_id?: string;
  voice_id?: string;
  analysis_status: string;
  total_slides: number;
  slides: Slide[];
}

export interface DeckScore {
  total_score: number;
  structure_summary: string;
  strengths: string[];
  improvements: string[];
}

export interface CriteriaScore {
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

export interface IRAnalysisResponse {
  ir_deck_id: string;
  pitch_id: string;
  analysis_status: string;
  version: number;
  deck_score: DeckScore;
  criteria_scores: CriteriaScore[];
  presentation_guide: PresentationGuide;
  analyzed_at: string;
}
