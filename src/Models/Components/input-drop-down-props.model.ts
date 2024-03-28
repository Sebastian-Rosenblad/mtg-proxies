export interface InputDropDownPropsM<T> {
  id: string;
  label: string;
  undefinable?: boolean;
  options: Array<{ value: T; name: string; }>;
  value: T;
  updateValue: (newValue: T) => void;
}
