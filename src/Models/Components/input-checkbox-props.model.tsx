export interface InputCheckboxPropsM {
  label: string;
  desc?: string;
  name: string;
  value: boolean;
  updateValue: (newValue: boolean) => void;
}
