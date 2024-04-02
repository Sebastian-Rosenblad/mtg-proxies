import React from "react";
import './SetsP.scss';
import { SetsPropsM } from "../../Models/Pages/sets-props.model";
import { InputTextC } from "../../Components/InputText/InputTextC";
import { SetM } from "../../Models/set.model";
import { createNewSet } from "../../Functions/set.functions";

export function SetsP(props: SetsPropsM): JSX.Element {
  const { sets, updateSets } = props;

  function handleCreate() {
    updateSets([...sets, createNewSet(sets.map(set => set.id))]);
  }
  function handleChange(index: number, key: keyof SetM, value: string) {
    let newSets: Array<SetM> = sets.map((set, i) => i === index ? { ...set, [key]: value } : set);
    updateSets(newSets);
  }

  return <div className="sets">
    <div className="sets--header">
      <button onClick={handleCreate}>Create New Set</button>
    </div>
    <div className="sets--content">
      {sets.map((set, i) => <div key={set.id} className="sets--content--set">
        <InputTextC
          label="Set name"
          name="name"
          value={set.name}
          updateValue={(value: string) => handleChange(i, "name", value)}
        />
        <InputTextC
          label="Icon name"
          name="icon"
          value={set.icon}
          updateValue={(value: string) => handleChange(i, "icon", value)}
        />
        <div className="sets--content--set--icons">
          <img className="sets--content--set--icons--icon" src={"/images/sets/" + set.icon + "-common.png"} />
          <img className="sets--content--set--icons--icon" src={"/images/sets/" + set.icon + "-uncommon.png"} />
          <img className="sets--content--set--icons--icon" src={"/images/sets/" + set.icon + "-rare.png"} />
          <img className="sets--content--set--icons--icon" src={"/images/sets/" + set.icon + "-mythic.png"} />
        </div>
      </div>)}
    </div>
  </div>;
}
