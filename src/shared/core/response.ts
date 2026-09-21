export type ResponseStatus = "success" | "error" | "warning" | "info";

export interface Response<T> {
  status: ResponseStatus;
  message?: string;
  data?: T;
  metadata?: Record<string, unknown>;
}
