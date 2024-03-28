import React, { useState } from "react";
import './EditP.scss';
import { EditPagePropsM } from "../../Models/Pages/edit-props.model";
import { CardC } from "../../Components/Card/CardC";
import { InputTextC } from "../../Components/InputText/InputTextC";
import { InputTextareaC } from "../../Components/InputTextarea/InputTextareaC";
import { InputTextArrayC } from "../../Components/InputTextArray/InputTextArrayC";
import { InputTextareaArrayC } from "../../Components/InputTextareaArray/InputTextareaArrayC";
import { CardM } from "../../Models/card.model";

interface FieldM {
  type: "text" | "textarea" | "text-array" | "textarea-array";
  label: string;
  key: keyof CardM;
  singular?: string;
}

export function EditP(props: EditPagePropsM): JSX.Element {
  const { saveCard, stopEditing, deleteCard } = props;
  const [editingCard, setEditingCard] = useState<CardM>(props.card);
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [illustration, setIllustration] = useState<number>(0);
  const [deleteConfirmation, setDeleteConfirmation] = useState<number>(0);

  function handleDeleteClick() {
    if (!deleteConfirmation) setDeleteConfirmation(Date.now());
    else if (Date.now() <= deleteConfirmation + 2000 && deleteCard) deleteCard(editingCard);
  }
  function handleChange(key: keyof CardM, value: string | Array<string>) {
    let card: CardM = { ...editingCard, [key]: value };
    setEditingCard(removeUndefined({ ...card }));
    setIsChanged(true);
  }
  function removeUndefined(card: CardM): CardM {
    if (card.hasOwnProperty("manaCost") && !card.manaCost) delete card.manaCost;
    if (card.hasOwnProperty("color") && card.color?.length === 0) delete card.color;
    if (card.hasOwnProperty("subtype") && !card.subtype) delete card.subtype;
    if (card.hasOwnProperty("flavorText") && !card.flavorText) delete card.flavorText;
    if (card.hasOwnProperty("power") && !card.power) delete card.power;
    if (card.hasOwnProperty("toughness") && !card.toughness) delete card.toughness;
    if (card.hasOwnProperty("loyalty") && !card.loyalty) delete card.loyalty;
    return card;
  }
  function handleSave() {
    saveCard(editingCard);
    setIsChanged(false);
  }

  const fields: Array<FieldM> = [
    { type: "text", label: "Name", key: "name" },
    { type: "text", label: "Mana value", key: "manaCost" },
    { type: "text-array", label: "Override color", key: "color", singular: "override color" },
    { type: "text-array", label: "Illustrations", key: "illustrations", singular: "illustration" },
    { type: "text", label: "Type", key: "type" },
    { type: "text", label: "Subtype", key: "subtype" },
    { type: "text", label: "Rarity", key: "rarity" },
    { type: "text", label: "Set", key: "set" },
    { type: "textarea-array", label: "Abilities", key: "text", singular: "ability" },
    { type: "textarea", label: "Flavor text", key: "flavorText" },
    { type: "text", label: "Power", key: "power" },
    { type: "text", label: "Toughness", key: "toughness" },
    { type: "text", label: "Loyalty", key: "loyalty" }
  ];

  return <div className="edit">
    <div className="edit--content">
      {fields.map((field: FieldM, index: number) =>
        field.type === "text" ? <InputTextC
          key={field.key + "-" + index}
          label={field.label}
          name={field.key}
          value={editingCard[field.key] as string || ""}
          updateValue={(value: string) => handleChange(field.key, value)}
        /> :
        field.type === "textarea" ? <InputTextareaC
          key={field.key + "-" + index}
          label={field.label}
          name={field.key}
          value={editingCard[field.key] as string || ""}
          updateValue={(value: string) => handleChange(field.key, value)}
        /> :
        field.type === "text-array" ? <InputTextArrayC
          key={field.key + "-" + index}
          label={field.label}
          name={field.key}
          value={editingCard[field.key] as Array<string> || []}
          updateValue={(value: Array<string>) => handleChange(field.key, value)}
          singular={field.singular || ""}
        /> :
        <InputTextareaArrayC
          key={field.key + "-" + index}
          label={field.label}
          name={field.key}
          value={editingCard[field.key] as Array<string> || []}
          updateValue={(value: Array<string>) => handleChange(field.key, value)}
          singular={field.singular || ""}
        />
      )}
      <div className="edit--content--buttons">
        {isChanged && <button onClick={handleSave}>Save</button>}
        <button onClick={stopEditing}>Back</button>
        {deleteCard && <button onClick={handleDeleteClick}>{Date.now() <= deleteConfirmation + 2000 ? "Confirm" : "Delete"}</button>}
      </div>
    </div>
    <div className="edit--card">
      <div className="edit--card--shrink">
        <CardC card={editingCard} illustration={illustration} updateIllustration={setIllustration} />
      </div>
    </div>
  </div>;
}
