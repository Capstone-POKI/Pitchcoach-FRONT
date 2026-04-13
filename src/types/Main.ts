export interface Pitch {
  pitch_id: string;
  title: string;
  pitch_type: string;
  pitch_type_display: string;
  status: "IN_PROGRESS" | "COMPLETED";
  application_period: string;
  progress?: number;
}
export type PitchStatus = "IN_PROGRESS" | "COMPLETED" | undefined;
