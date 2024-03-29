import { SetM } from "../set.model";

export interface SetsPropsM {
  sets: Array<SetM>;
  updateSets: (newSets: Array<SetM>) => void;
}
