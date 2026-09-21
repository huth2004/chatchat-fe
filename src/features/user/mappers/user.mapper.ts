import * as UserTypes from "@/features/user/types/user.type";

export class UserMapper {
  static toUser(userDTO: UserTypes.UserDTO): UserTypes.User {
    return {
      id: userDTO.id,
      username: userDTO.username,
      avatar: userDTO.avatar ?? null,
    };
  }
}
