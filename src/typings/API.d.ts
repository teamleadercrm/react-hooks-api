export type Response = {
  data: object | [];
  included?: {
    [key: string]: [];
  };
  meta?: {
    matches: number;
    size: number;
  };
};
