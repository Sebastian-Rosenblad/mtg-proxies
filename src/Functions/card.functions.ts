import { CardM } from "../Models/card.model";

function getNewId(ids: Array<string>): string {
  let id: string = Math.random().toString(16).slice(2, 8);
  while (ids.includes(id)) id = Math.random().toString(16).slice(2, 8);
  return id;
}

export function createNewCard(ids: Array<string>): CardM {
  return {
    id: getNewId(ids),
    published: false,
    name: "New Card",
    imageUrl: [],
    type: "Creature",
    rarity: "Common",
    set: "Sebastian",
    text: []
  }
}

export function getColors(card: CardM): Array<string> {
  if (card.type === "Emblem") return ["emblem"];
  const colors: Array<string> = ["white", "blue", "black", "red", "green"].filter(color => findColor(card, color));
  return colors;
}
export function getColorIdentityName(colors: Array<string>) {
  if (colors.length === 1) return colors[0];
  if (colors.length === 2) {
    switch (colors.join("")) {
      case "whiteblue": return "azorius";
      case "whiteblack": return "orzhov";
      case "whitered": return "boros";
      case "whitegreen": return "selesnya";
      case "blueblack": return "dimir";
      case "bluered": return "izzet";
      case "bluegreen": return "simic";
      case "blackred": return "rakdos";
      case "blackgreen": return "golgari";
      case "redgreen": return "gruul";
    }
  }
  if (colors.length === 3) {
    switch (colors.join("")) {
      case "whiteblueblack": return "";
      case "whitebluered": return "";
      case "whitebluegreen": return "";
      case "whiteblackred": return "";
      case "whiteblackgreen": return "";
      case "whiteredgreen": return "";
      case "blueblackred": return "";
      case "blueblackgreen": return "";
      case "blueredgreen": return "";
      case "blackredgreen": return "";
    }
  }
  if (colors.length === 4) {
    switch (colors.join("")) {
      case "whiteblueblackred": return "";
      case "whiteblueblackgreen": return "";
      case "whiteblueredgreen": return "";
      case "whiteblackredgreen": return "";
      case "blueblackredgreen": return "";
    }
  }
  if (colors.length === 5) return "wubrg";
  return "colorless"
}
export function getColorIcons(colors: Array<string>): Array<string> {
  if (colors.length === 0) return ["{C}"];
  return colors.map(color => colorKeys.hasOwnProperty(color) ? colorKeys[color].icons[0] : "{C}");
}
const colorKeys: { [key: string]: { land: string; icons: Array<string>; }; } = {
  white: { land: "Plains", icons: ["{W}", "{GW}", "{RW}", "{WB}", "{WU}", "{WP}"] },
  blue: { land: "Island", icons: ["{U}", "{GU}", "{WU}", "{UR}", "{UB}", "{UP}"] },
  black: { land: "Swamp", icons: ["{B}", "{BG}", "{WB}", "{BR}", "{UB}", "{BP}"] },
  red: { land: "Mountain", icons: ["{R}", "{RG}", "{RW}", "{BR}", "{UR}", "{RP}"] },
  green: { land: "Forest", icons: ["{G}", "{GW}", "{RG}", "{BG}", "{GU}", "{GP}"] },
  colorless: { land: "Wastes", icons: ["{C}", "{X}"] },
};
function findColor(card: CardM, color: string): boolean {
  if (card.colorIdentity) return card.colorIdentity.split(" ").includes(color);
  if (card.type.includes("Land") && card.subtype?.includes(colorKeys[color].land)) return true;
  if (colorKeys[color].icons.find(icon => card.manaCost?.includes(icon))) return true;
  if (colorKeys[color].icons.find(icon => card.text?.find(text => text.includes(icon)))) return true;
  return false;
}
export function getManaValue(card: CardM): number {
  if (!card.manaCost) return 0;
  const manaSymbols: RegExpMatchArray | null = card.manaCost.match(/{[^}]+}/g);
  if (!manaSymbols) return 0;
  return manaSymbols.reduce((total, symbol) => {
    const value = symbol.replace(/[{}]/g, '');
    return total + (isNaN(parseInt(value)) ? 1 : parseInt(value));
  }, 0);
}

export function getStats(card: CardM): string {
  if (card.power && card.toughness) return card.power + "/" + card.toughness;
  if (card.loyalty) return card.loyalty.toString();
  return "";
}
