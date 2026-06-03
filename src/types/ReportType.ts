export interface ReportDetailScore {
  title: string;
  score: number;
  description: string;
  strengths: string[];
  improvements: string[];
}

export interface GenerateReportResponse {
  pitch_id: string;
  report_id?: string;
  final_score: number;
  radar_chart: {
    labels: string[];
    scores: number[];
  };
  bar_chart: {
    items: { label: string; score: number }[];
  };
  detail_scores: ReportDetailScore[];
  improvement_points: string[];
  summary: string;
  generated_at: string;
}

export interface GetReportResponse {
  report_id: string;
  notice: { summary: string; score: number };
  ir_deck: { summary: string; score: number };
  speech: { summary: string; score: number };
  qa: { summary: string; score: number };
  final_score: number;
  chart_data: { labels: string[]; scores: number[] };
  ai_report: GenerateReportResponse | null;
  updated_at: string;
}
