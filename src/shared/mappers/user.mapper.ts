import * as UserTypes from "@/shared/types/user.type";

export class UserMapper {
  static toUser(userDTO: UserTypes.UserDTO): UserTypes.User {
    return {
      id: userDTO.id,
      displayName: userDTO.username,
      avatar: userDTO.avatar,
    };
  }
}
