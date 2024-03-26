import React, { useState } from "react";
import './CardC.scss';
import { CardComponentPropsM } from "../../Models/Components/card-props.model";
import { getCardColor, getCardStats, getColorName } from "../../Functions/card.functions";

export function CardC(props: CardComponentPropsM): JSX.Element {
  const { card, illustration, updateIllustration } = props;

  function cycleVariation() {
    if (updateIllustration && illustration !== undefined) updateIllustration((illustration + 1) % card.illustrations.length);
  }

  const cardClasses = (): string => {
    let c: Array<string> = ["card"];
    if (card.text.length > 0)
      c.push("has-text");
    if (getCardStats(card) !== "")
      c.push("has-stats");
    return c.join(" ");
  };
  const contentClasses = (): string => {
    return ["card--content", "card--color-" + getColorName(getCardColor(card))].join(" ");
  }
  function getTitleClasses(): string {
    let classes: Array<string> = ["card--body--title"];
    if (getCardStats(card) !== "" && card.text.length === 0) classes.push("move-up");
    return classes.join(" ");
  }
  function getTextClasses(): string {
    let classes: Array<string> = ["card--body--text"];
    if (textShouldBeCentered()) classes.push("center");
    if (getCardStats(card) !== "") classes.push("has-stats");
    return classes.join(" ");
  }
  
  function textShouldBeCentered(): boolean {
    if (card.text) {
      const keywords = [",", "&", "haste", "flying", "first strike", "double strike", "trample", "flash", "vigilance", "lifelink", "reach", "deathtouch", "indestructible", "menace", "hexproof", "shroud", "defender", "protection", "fear", "intimidate", "landwalk", "islandwalk", "forestwalk", "mountainwalk", "swampwalk", "plainswalk", "mill", "scry", "fight", "morph", "megamorph", "surveil", "mutate", "equip", "fortify", "enchant", "aura", "kick", "prowess", "fabricate", "convoke", "explore", "extort", "dredge", "afflict", "amass", "annihilator", "banding", "battle cry", "bestow", "bloodthirst", "bushido", "cascade", "champion", "changeling", "cipher", "clash", "companion", "conspire", "contrive", "crew", "cumulative upkeep", "cycling", "dash", "delve", "devour", "domain", "echo", "embalm", "emerge", "entwine", "epic", "escape", "eternalize", "evoke", "evolve", "exalted", "exploit", "extort", "fading", "flanking", "forecast", "fortell", "fuse", "goad", "graft", "gravestorm", "haunt", "hideaway", "horsemanship", "improvise", "infect", "ingest", "join forces", "level up", "living weapon", "manifest", "meld", "miracle", "monstrosity", "morbid", "myriad", "ninjutsu", "offering", "outlast", "overload", "partner", "persist", "phasing", "poisonous", "populate", "proliferate", "raid", "rally", "rebound", "recover", "reinforce", "renown", "replicate", "revolt", "ripple", "sacrifice", "scavenge", "shadow", "soulbond", "soulshift", "spectacle", "splice", "split second", "storm", "sunburst", "support", "suspend", "totem armor", "transfigure", "transform", "transmute", "undying", "unearth", "vanishing", "venture", "wither", "absorb", "aftermath", "awaken", "blitz", "boast", "channel", "connive", "daybound", "disturb", "embolden", "encore", "energize", "fateful hour", "ferocious", "formidable", "foundry", "frenzy", "fuse", "hellbent", "heroic", "imprint", "inspire", "join forces", "kinship", "landship", "lieutenant", "metalcraft", "morbid", "parley", "radiance", "raid", "rally", "recover", "reinforce", "renown", "revolt", "spell mastery", "strive", "sweep", "tempting offer", "threshold", "undergrowth", "will of the council"];
      for (let i = 0; i < card.text.length; i++) {
        const words = card.text[i].toLowerCase().split(/\s+/);
        if (!words.every(word => keywords.includes(word.toLocaleLowerCase()))) {
          return false;
        }
      }
    }
    return true;
  }

  function toJSX(text: string, key?: string, className?: string, listItem?: boolean): JSX.Element {
    let newtext: string = text.replace(/\((.*?)\)/g, '<i>($1)</i>');
    newtext = newtext.replace(/\{([WUBRGCTXSP\d]+)\}/g, '<span class="inline-icon icon--$1"></span>');
    newtext = newtext.replace(/\*([^*]+)\*/g, '<i>$1</i>');
    if (listItem) return <li key={key} className={className} dangerouslySetInnerHTML={{ __html: newtext }} />;
    return <p key={key} className={className} dangerouslySetInnerHTML={{ __html: newtext }} />;
  }
  function getText(): JSX.Element {
    const listItems: JSX.Element[] = [];
    let currentList: JSX.Element[] = [];
  
    card.text.forEach((text: string, i: number) => {
      if (text.startsWith('•')) {
        currentList.push(toJSX(text.slice(2), card.id + '-text-' + i, card.id + '-text-' + i, true));
      } else {
        if (currentList.length > 0) {
          listItems.push(<ul key={card.id + '-list-' + i}>{currentList}</ul>);
          currentList = [];
        }
        listItems.push(toJSX(text, card.id + '-text-' + i));
      }
    });
    if (currentList.length > 0) listItems.push(<ul key={card.id + '-list-end'}>{currentList}</ul>);
    if (!card.flavorText) return <div className={getTextClasses()}>{listItems}</div>
    const flavorTextParts = card.flavorText.split('—');
    if (flavorTextParts.length === 1) return <div className={getTextClasses()}>
      {listItems}
      <p className="card--body--flavor-text"><i>{card.flavorText}</i></p>
    </div>;
    return <div className={getTextClasses()}>
      {listItems}
      <p className="card--body--flavor-text"><i>{flavorTextParts[0].trim()}<br/><span style={{ float: 'right' }}>— {flavorTextParts[1].trim()}</span></i></p>
    </div>;
  }

  return <div className={cardClasses()}>
    <div className={contentClasses()}>
      <div className="card--header">
        <div className="card--header--left-border"></div>
        <p className="card--header--name">{card.name}</p>
        {card.manaCost && toJSX(card.manaCost, undefined, "card--header--mana-cost")}
        <div className="card--header--right-border"></div>
      </div>
      <div
        className="card--art"
        style={{backgroundImage: 'url("/images/art/' + card.illustrations[props.illustration || 0] + '.png")'}}
        onClick={cycleVariation}
      ></div>
      <div className="card--body">
        <div className={getTitleClasses()}>
          <div className="card--body--title--left-border"></div>
          <div className="card--body--title--content">
            {card.subtype && <p>{card.type} — {card.subtype}</p>}
            {!card.subtype && <p>{card.type}</p>}
            <img className="card--body--title--content--set" src={"/images/sets/" + card.set.toLocaleLowerCase() + "-" + card.rarity.toLocaleLowerCase().split(" ")[0] + ".png"} />
          </div>
          <div className="card--body--title--right-border"></div>
        </div>
        {card.text.length > 0 && getText()}
        {getCardStats(card) && <p className="card--body--stats">{getCardStats(card)}</p>}
      </div>
    </div>
  </div>;
}
