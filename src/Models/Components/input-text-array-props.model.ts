import { CardM } from "../card.model";

export interface InputTextArrayPropsM {
  label: string;
  name: keyof CardM;
  value: Array<string>;
  updateValue: (newValue: Array<string>) => void;
  singular: string;
}
