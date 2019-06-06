export interface Entity {
  id: string;
}

export type Response = {
  data: Entity | Entity[];
  included?: {
    [key: string]: Entity[];
  };
  meta?: {
    matches: number;
    size: number;
  };
};
