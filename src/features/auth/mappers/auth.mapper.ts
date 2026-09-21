import * as AuthTypes from "@/features/auth/types/auth.type";

export class AuthMapper {
  static toAuthUser(authUserDTO: AuthTypes.AuthUserDTO): AuthTypes.AuthUser {
    return {
      id: authUserDTO.id,
      username: authUserDTO.username,
      avatar: authUserDTO.avatar,
      role: authUserDTO.role,
    };
  }

  static toLoginUserDTO(
    loginUser: AuthTypes.LoginUser,
  ): AuthTypes.LoginUserDTO {
    return {
      username: loginUser.username,
      password: loginUser.password,
    };
  }

  static toRegisterUserDTO(
    registerUser: AuthTypes.RegisterUser,
  ): AuthTypes.RegisterUserDTO {
    return {
      username: registerUser.username,
      password: registerUser.password,
      acceptTerms: registerUser.acceptTerms,
    };
  }
}
