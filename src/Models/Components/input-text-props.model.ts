import { CardM } from "../card.model";

export interface InputTextPropsM {
  label: string;
  desc?: string;
  name: string;
  value: string;
  updateValue: (newValue: string) => void;
}
