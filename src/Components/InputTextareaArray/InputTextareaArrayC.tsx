import React from "react";
import './InputTextareaArrayC.scss';
import { InputTextareaArrayPropsM } from "../../Models/Components/input-textarea-array-props.model";

export function InputTextareaArrayC(props: InputTextareaArrayPropsM): JSX.Element {
  const { label, name, value, updateValue, singular } = props;

  function handleAdd() {
    updateValue([...value, ""]);
  }
  function handleChange(index: number, newValue: string) {
    updateValue(value.map((line: string, i: number) => i === index ? newValue : line));
  }
  function handleRemove(index: number) {
    updateValue(value.filter((_, i: number) => i !== index));
  }

  return <div className="input-textarea-array">
    <label>{label}</label>
    <div className="input-textarea-array--array">
      {value.map((line: string, index: number) => (
        <div key={name + "-" + index} className="input-textarea-array--array--item">
          <textarea
            name={name}
            value={line}
            onChange={(evt) => handleChange(index, evt.target.value)}
          />
          <button onClick={() => handleRemove(index)}>Remove</button>
        </div>
      ))}
      <button onClick={handleAdd}>Add {singular}</button>
    </div>
  </div>;
}
