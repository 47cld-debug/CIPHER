import apiClient from './client';
import type {
  RequestOTPRequest,
  RequestOTPResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  SelectRoleRequest,
  SelectRoleResponse,
} from '../types/auth';

export const authApi = {
  requestOTP: async (data: RequestOTPRequest): Promise<RequestOTPResponse> => {
    const response = await apiClient.post('/auth/request-otp', data);
    return response.data;
  },

  verifyOTP: async (data: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
    const response = await apiClient.post('/auth/verify-otp', data);
    return response.data;
  },

  selectRole: async (data: SelectRoleRequest): Promise<SelectRoleResponse> => {
    const response = await apiClient.post('/auth/select-role', data);
    return response.data;
  },
};
