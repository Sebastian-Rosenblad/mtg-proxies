import { CardM } from "../Models/card.model";

function getNewId(ids: Array<string>): string {
  let id: string = Math.random().toString(16).slice(2, 8);
  while (ids.includes(id)) id = Math.random().toString(16).slice(2, 8);
  return id;
}

export function createNewCard(ids: Array<string>): CardM {
  return {
    id: getNewId(ids),
    name: "New Card",
    illustrations: [],
    type: "Creature",
    rarity: "Common",
    set: "",
    text: []
  }
}

export function getCardColor(card: CardM): Array<string> {
  if (card.color) return card.color;
  if (card.type.includes("Land") && card.subtype) getColorFromLandtype(card.subtype);
  if (!card.manaCost) return ["colorless"];
  return getColorFromText(card.manaCost);
}
export function getCardColorIdentity(card: CardM): Array<string> {
  let colors: Set<string> = new Set<string>(getCardColor(card));
  for (const text in card.text) getColorFromText(text).forEach(color => colors.add(color));
  if (colors.size > 1 && colors.has("colorless")) colors.delete("colorless");
  return Array.from(colors);
}
const colorKeys: { [key: string]: { land: string; icons: Array<string>; }; } = {
  white: { land: "Plains", icons: ["{W}", "{GW}", "{RW}", "{WB}", "{WU}", "{WP}"] },
  blue: { land: "Island", icons: ["{U}", "{GU}", "{WU}", "{UR}", "{UB}", "{UP}"] },
  black: { land: "Swamp", icons: ["{B}", "{BG}", "{WB}", "{BR}", "{UB}", "{BP}"] },
  red: { land: "Mountain", icons: ["{R}", "{RG}", "{RW}", "{BR}", "{UR}", "{RP}"] },
  green: { land: "Forest", icons: ["{G}", "{GW}", "{RG}", "{BG}", "{GU}", "{GP}"] }
};
function getColorFromLandtype(landtype: string): Array<string> {
  let colors: Array<string> = [];
  for (let color in colorKeys)
    if (landtype.includes(colorKeys[color].land))
      colors.push(color);
  return colors;
}
function getColorFromText(text: string): Array<string> {
  let colors: Set<string> = new Set<string>();
  for (let color in colorKeys) 
    for (let icon of colorKeys[color].icons)
      if (text.includes(icon))
        colors.add(color);
  return Array.from(colors);
}
export function getColorName(colors: Array<string>): string {
  if (colors.length === 1) return colors[0];
  const order = ["white", "blue", "black", "red", "green"];
  const sortedColors = colors.sort((a, b) => order.indexOf(a) - order.indexOf(b)).join(",");
  const colorCombinations: { [combination: string]: string } = {
    "white,blue": "Azorius",
    "white,black": "Orzhov",
    "white,red": "Boros",
    "white,green": "Selesnya",
    "blue,black": "Dimir",
    "blue,red": "Izzet",
    "blue,green": "Simic",
    "black,red": "Rakdos",
    "black,green": "Golgari",
    "red,green": "Gruul",
    "white,blue,black": "Esper",
    "white,blue,red": "Jeskai",
    "white,blue,green": "Bant",
    "white,black,red": "Mardu",
    "white,black,green": "Abzan",
    "white,red,green": "Naya",
    "blue,black,red": "Grixis",
    "blue,black,green": "Sultai",
    "blue,red,green": "Temur",
    "black,red,green": "Jund",
    "white,blue,black,red": "Artifice",
    "white,blue,black,green": "Growth",
    "white,blue,red,green": "Altruism",
    "white,black,red,green": "Aggression",
    "blue,black,red,green": "Chaos",
    "white,blue,black,red,green": "WUBRG"
  };
  return colorCombinations[sortedColors] || "colorless";
}

export function getColorIcons(colors: Array<string>): Array<string> {
  if (colors.length === 0) return ["{C}"];
  return colors.map(color => colorKeys[color]?.icons[0] || "{C}");
}

export function getCardManaValue(card: CardM): number {
  if (!card.manaCost) return 0;
  const manaSymbols: RegExpMatchArray | null = card.manaCost.match(/{[^}]+}/g);
  if (!manaSymbols) return 0;
  return manaSymbols.reduce((total, symbol) => {
    const value = symbol.replace(/[{}]/g, "");
    return total + (isNaN(parseInt(value)) ? 1 : parseInt(value));
  }, 0);
}

export function getCardStats(card: CardM): string {
  if (card.power && card.toughness) return card.power + "/" + card.toughness;
  if (card.loyalty) return card.loyalty;
  return "";
}
