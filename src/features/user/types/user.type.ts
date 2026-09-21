// Type for UI
export type User = {
  id: string;
  username: string;
  avatar: string | null;
};

// Type for API
export type UserDTO = {
  id: string;
  username: string;
  avatar?: string;
};
