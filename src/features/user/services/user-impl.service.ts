import { UserService } from "./user.service";
import * as UserTypes from "@/features/user/types/user.type";
import { Response } from "@/shared/core/response";
import { apiRequest } from "@/shared/utils/api-client";

class UserImplService implements UserService {
  getProfile(userId: string): Promise<Response<UserTypes.User>> {
    return apiRequest<UserTypes.User>(`/users/${encodeURIComponent(userId)}`);
  }

  searchProfile(query: string): Promise<Response<UserTypes.User[]>> {
    return apiRequest<UserTypes.User[]>(
      `/users/search/${encodeURIComponent(query)}`,
    );
  }
}

export const userService: UserService = new UserImplService();
