import { User } from "@/shared/types/user.type";

export interface UserService {
  getProfile(userId: string): Promise<User>;
}
