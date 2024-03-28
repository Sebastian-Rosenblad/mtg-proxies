import React from "react";
import './InputTextArrayC.scss';
import { InputTextArrayPropsM } from "../../Models/Components/input-text-array-props.model";

export function InputTextArrayC(props: InputTextArrayPropsM): JSX.Element {
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

  return <div className="input-text-array">
    <label>{label}</label>
    <div className="input-text-array--array">
      {value.map((line: string, index: number) => (
        <div key={name + "-" + index} className="input-text-array--array--item">
          <input
            type="text"
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
