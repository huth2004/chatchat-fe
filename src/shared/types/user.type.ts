// Type for UI
export type User = {
  id: string;
  displayName: string;
  avatar?: string;
};

// Type for API
export type UserDTO = {
  id: string;
  username: string;
  avatar?: string;
};
