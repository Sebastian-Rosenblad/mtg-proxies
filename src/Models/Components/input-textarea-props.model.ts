import { CardM } from "../card.model";

export interface InputTextareaPropsM {
  label: string;
  name: keyof CardM;
  value: string;
  updateValue: (newValue: string) => void;
}
