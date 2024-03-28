import React from "react";
import './InputTextareaC.scss';
import { InputTextareaPropsM } from "../../Models/Components/input-textarea-props.model";

export function InputTextareaC(props: InputTextareaPropsM): JSX.Element {
  const { label, name, value, updateValue } = props;

  function handleChange(evt: React.ChangeEvent<HTMLTextAreaElement>) {
    updateValue(evt.target.value);
  }

  return <div className="input-textarea">
    <label>{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={handleChange}
    ></textarea>
  </div>;
}
