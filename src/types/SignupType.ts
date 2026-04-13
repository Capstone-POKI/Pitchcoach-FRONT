export interface SignupRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface PatchProfileRequest {
  name?: string;
  phone?: string;
  gender: string;
  education: string;
  business_field: string;
  business_duration: string;
}
