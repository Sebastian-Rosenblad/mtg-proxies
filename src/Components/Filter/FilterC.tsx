import React from "react";
import './FilterC.scss';
import { FilterPropsM } from "../../Models/Components/filter-props.model";
import { InputDropDownC } from "../InputDropDown/InputDropDownC";
import { InputTextC } from "../InputText/InputTextC";

export function FilterC(props: FilterPropsM): JSX.Element {
  const { filters, sets, updateFilters } = props;

  return <div className="filter">
    <InputDropDownC
      id="home-set-filter"
      label="Set"
      undefinable={true}
      options={sets.map(set => { return { value: set.id, name: set.name }; })}
      value={filters.set}
      updateValue={(value: string | undefined) => updateFilters({ ...filters, set: value })}
    />
    <InputTextC
      label="Type/Subtype"
      name="type"
      value={filters.type || ""}
      updateValue={(value: string | undefined) => updateFilters({ ...filters, type: value === "" ? undefined : value })}
    />
  </div>;
}
