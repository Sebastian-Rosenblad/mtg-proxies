import React from "react";
import './HomeP.scss';
import { HomePagePropsM } from "../../Models/Pages/home-props.model";
import { CardLineC } from "../../Components/CardLine/CardLineC";
import { CardM } from "../../Models/card.model";
import { getColors, getManaValue } from "../../Functions/card.functions";

export function HomeP(props: HomePagePropsM): JSX.Element {
  const { cards, createCard, editCard, deleteCard } = props;

  function sort(a: CardM, b: CardM): number {
    if (a.type.includes("Emblem") !== b.type.includes("Emblem")) return a.type.includes("Emblem") ? 1 : -1;
    if (a.type.includes("Token") !== b.type.includes("Token")) return a.type.includes("Token") ? 1 : -1;
    const colors: Array<Array<string>> = [getColors(a), getColors(b)];
    const colorSortOrder: Array<string> = ["green", "white", "red", "black", "blue", "colorless"];
    if (colors[0].join("") !== colors[1].join("")) {
      if (colors[0].length !== colors[1].length) return colors[0].length - colors[1].length;
      let sortedColorsA = colors[0].sort((c1, c2) => colorSortOrder.indexOf(c1) - colorSortOrder.indexOf(c2));
      let sortedColorsB = colors[1].sort((c1, c2) => colorSortOrder.indexOf(c1) - colorSortOrder.indexOf(c2));
      for (let i = 0; i < Math.min(sortedColorsA.length, sortedColorsB.length); i++) {
        if (sortedColorsA[i] !== sortedColorsB[i]) {
          return colorSortOrder.indexOf(sortedColorsA[i]) - colorSortOrder.indexOf(sortedColorsB[i]);
        }
      }
    }
    const types: Array<Array<string>> = [a.type.split(" "), b.type.split(" ")];
    const sortTypeOrder: Array<string> = ["Creature", "Instant", "Sorcery", "Enchantment", "Planeswalker", "Artifact", "Land"];
    for (let type of sortTypeOrder) {
      const aHasType = types[0].includes(type);
      const bHasType = types[1].includes(type);
      if (aHasType !== bHasType) return aHasType ? -1 : 1;
      if (aHasType && bHasType) break;
    }
    const manaValues: Array<number> = [getManaValue(a), getManaValue(b)];
    if (manaValues[0] !== manaValues[1]) return manaValues[0] - manaValues[1];
    if (a.power && b.power) {
      const powers: Array<number> = [isNaN(parseInt(a.power)) ? 0 : parseInt(a.power), isNaN(parseInt(b.power)) ? 0 : parseInt(b.power)];
      if (powers[0] !== powers[1]) return powers[0] - powers[1];
    }
    if (a.toughness && b.toughness) {
      const toughnesses: Array<number> = [isNaN(parseInt(a.toughness)) ? 0 : parseInt(a.toughness), isNaN(parseInt(b.toughness)) ? 0 : parseInt(b.toughness)];
      if (toughnesses[0] !== toughnesses[1]) return toughnesses[0] - toughnesses[1];
    }
    if (a.loyalty && b.loyalty && a.loyalty !== b.loyalty) return a.loyalty - b.loyalty;
    return a.name.localeCompare(b.name);
  }

  return <div className="home">
    <div className="home--header">
      <button onClick={createCard}>Create New Card</button>
    </div>
    <div className="home--list">
      {cards.sort(sort).map((card) => (
        <CardLineC key={card.id} card={card} editCard={() => editCard(card)} deleteCard={() => deleteCard(card)} />
      ))}
    </div>
  </div>;
}
