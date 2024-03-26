export interface CardM {
  id: string;
  name: string;
  manaCost?: string;
  color?: Array<string>;
  illustrations: Array<string>;
  type: string;
  subtype?: string;
  rarity: string;
  set: string;
  text: Array<string>;
  flavorText?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
}
