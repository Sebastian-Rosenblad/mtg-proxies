import React from "react";
import './InputTextC.scss';
import { InputTextPropsM } from "../../Models/Components/input-text-props.model";

export function InputTextC(props: InputTextPropsM): JSX.Element {
  const { label, desc, name, value, updateValue } = props;

  function handleChange(evt: React.ChangeEvent<HTMLInputElement>) {
    updateValue(evt.target.value);
  }

  if (desc !== undefined && desc !== "") return <div className="input-text description">
    <div className="input-text--input-area">
      <label>{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={handleChange}
      ></input>
    </div>
    <p><i>{desc}</i></p>
  </div>
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
