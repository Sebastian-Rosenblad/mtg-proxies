import React, { useEffect, useState } from "react";
import './HomeP.scss';
import { HomePagePropsM } from "../../Models/Pages/home-props.model";
import { CardLineC } from "../../Components/CardLine/CardLineC";
import { CardC } from "../../Components/Card/CardC";
import { FilterC } from "../../Components/Filter/FilterC";
import { CardM } from "../../Models/card.model";
import { FiltersM } from "../../Models/filters.model";
import { getCardColorIdentity, getCardManaValue, getCardsSet } from "../../Functions/card.functions";
import { SaveManager } from "../../Classes/save-manager.class";
import { SettingsM } from "../../Models/settings.model";

export function HomeP(props: HomePagePropsM): JSX.Element {
  const { cards, sets, createCard, editCard, deleteCard } = props;
  const [filters, setFilters] = useState<FiltersM>(SaveManager.loadFilters());
  const [settings, setSettings] = useState<SettingsM>(SaveManager.loadSettings());

  useEffect(() => {
    SaveManager.saveFilters(filters);
  }, [filters]);
  useEffect(() => {
    SaveManager.saveSettings(settings);
  }, [settings]);

  function filter(card: CardM): boolean {
    if (filters.set !== undefined && card.set !== filters.set) return false;
    if (filters.type !== undefined && !(card.type.toLocaleLowerCase().includes(filters.type.toLocaleLowerCase()) || card.subtype?.toLocaleLowerCase().includes(filters.type.toLocaleLowerCase()))) return false;
    return true;
  }
  function sort(a: CardM, b: CardM): number {
    if (a.type.includes("Emblem") !== b.type.includes("Emblem")) return a.type.includes("Emblem") ? 1 : -1;
    if (a.type.includes("Token") !== b.type.includes("Token")) return a.type.includes("Token") ? 1 : -1;
    const colors: Array<Array<string>> = [getCardColorIdentity(a), getCardColorIdentity(b)];
    const colorSortOrder: Array<string> = ["green", "white", "red", "black", "blue", "colorless"];
    if (colors[0].join("") !== colors[1].join("")) {
      if (colors[0].length !== colors[1].length) return colors[0].length - colors[1].length;
      let sortedColorsA = [...colors[0]].sort((c1, c2) => colorSortOrder.indexOf(c1) - colorSortOrder.indexOf(c2));
      let sortedColorsB = [...colors[1]].sort((c1, c2) => colorSortOrder.indexOf(c1) - colorSortOrder.indexOf(c2));
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
    const manaValues: Array<number> = [getCardManaValue(a), getCardManaValue(b)];
    if (manaValues[0] !== manaValues[1]) return manaValues[0] - manaValues[1];
    if (a.power && b.power) {
      const powers: Array<number> = [isNaN(parseInt(a.power)) ? 0 : parseInt(a.power), isNaN(parseInt(b.power)) ? 0 : parseInt(b.power)];
      if (powers[0] !== powers[1]) return powers[0] - powers[1];
    }
    if (a.toughness && b.toughness) {
      const toughnesses: Array<number> = [isNaN(parseInt(a.toughness)) ? 0 : parseInt(a.toughness), isNaN(parseInt(b.toughness)) ? 0 : parseInt(b.toughness)];
      if (toughnesses[0] !== toughnesses[1]) return toughnesses[0] - toughnesses[1];
    }
    if (a.loyalty && b.loyalty) {
      const loyalties: Array<number> = [isNaN(parseInt(a.loyalty)) ? 0 : parseInt(a.loyalty), isNaN(parseInt(b.loyalty)) ? 0 : parseInt(b.loyalty)];
      if (loyalties[0] !== loyalties[1]) return loyalties[0] - loyalties[1];
    }
    return a.name.localeCompare(b.name);
  }

  return <div className="home">
    <div className="home--header">
      <button onClick={createCard}>Create New Card</button>
      <p>Filter:</p>
      <FilterC
        filters={filters}
        sets={sets}
        updateFilters={setFilters}
      />
      <button onClick={() => setSettings({ ...settings, cardView: !settings.cardView })}>{settings.cardView ? "List view" : "Card view"}</button>
      {settings.cardView && <button onClick={() => setSettings({ ...settings, homeSize: settings.homeSize === "small" ? "large" : "small" })}>{settings.homeSize === "small" ? "Large cards" : "Small cards"}</button>}
    </div>
    <div className={settings.cardView ? "home--cards" : "home--list"}>
      {settings.cardView && cards.filter(filter).sort(sort).map(card =>
        card.illustrations.map((_, i) =>
          <div key={card.id + "-" + i} className={["home--cards--card", settings.homeSize].join(" ")} onClick={() => editCard(card)}>
            <div className={["home--cards--card--shrink", settings.homeSize].join(" ")}>
              <CardC card={card} set={getCardsSet(card, sets)} illustration={i} />
            </div>
          </div>
        )
      )}
      {!settings.cardView && cards.filter(filter).sort(sort).map(card =>
        <CardLineC key={card.id} card={card} set={getCardsSet(card, sets)} selectCard={() => editCard(card)} deleteCard={deleteCard ? () => deleteCard(card) : undefined} />
      )}
    </div>
  </div>;
}
