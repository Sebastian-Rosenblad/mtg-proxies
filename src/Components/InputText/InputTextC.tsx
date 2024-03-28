import React from "react";
import './InputTextC.scss';
import { InputTextPropsM } from "../../Models/Components/input-text-props.model";

export function InputTextC(props: InputTextPropsM): JSX.Element {
  const { label, name, value, updateValue } = props;

  function handleChange(evt: React.ChangeEvent<HTMLInputElement>) {
    updateValue(evt.target.value);
  }

  return <div className="input-text">
    <label>{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={handleChange}
    ></input>
  </div>;
}
