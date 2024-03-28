import React from "react";
import './InputDropDownC.scss';
import { InputDropDownPropsM } from "../../Models/Components/input-drop-down-props.model";

export function InputDropDownC<T>(props: InputDropDownPropsM<T>): JSX.Element {
  const { id, label, undefinable, options, value, updateValue } = props;

  const handleChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = options.find(option => String(option.value) === evt.target.value)?.value;
    updateValue(selectedValue as T);
  };

  return <div className="input-drop-down">
    <label>{label}</label>
    <select value={String(value)} onChange={handleChange}>
      {undefinable && <option value=""></option>}
      {options.map((option) => (
        <option key={id + "-" + String(option.value)} value={String(option.value)}>{option.name}</option>
      ))}
    </select>
  </div>;
}
