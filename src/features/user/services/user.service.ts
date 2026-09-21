import { Response } from "@/shared/core/response";
import { User } from "@/features/user/types/user.type";

export interface UserService {
  getProfile(userId: string): Promise<Response<User>>;
  searchProfile(query: string): Promise<Response<User[]>>;
}
