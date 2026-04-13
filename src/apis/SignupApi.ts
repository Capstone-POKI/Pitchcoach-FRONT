import {
  LoginRequest,
  PatchProfileRequest,
  SignupRequest,
} from "@/types/SignupType";
import api from "./AxiosInstance";

export const PostSignup = async (data: SignupRequest) => {
  const response = await api.post("/api/auth/signup", data);
  return response.data;
};

export const PostLogin = async (data: LoginRequest) => {
  const response = await api.post("/api/auth/login", data);
  return response.data;
};

export const PatchUserProfile = async (data: PatchProfileRequest) => {
  const response = await api.patch("/api/users/me/profile", data);
  return response.data;
};
