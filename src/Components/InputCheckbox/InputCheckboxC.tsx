import React from "react";
import './InputCheckboxC.scss';
import { InputCheckboxPropsM } from "../../Models/Components/input-checkbox-props.model";

export function InputCheckboxC(props: InputCheckboxPropsM): JSX.Element {
  const { label, desc, name, value, updateValue } = props;

  function handleChange(evt: React.ChangeEvent<HTMLInputElement>) {
    updateValue(evt.target.checked);
  }

  return <div className={["input-checkbox", desc !== undefined ? desc : ""].join(" ")}>
    <div className="input-checkbox--input-area">
      <input
        type="checkbox"
        name={name}
        checked={value}
        onChange={handleChange}
      ></input>
      <label>{label}</label>
    </div>
    {desc !== undefined && desc !== "" && <p><i>{desc}</i></p>}
  </div>
}
