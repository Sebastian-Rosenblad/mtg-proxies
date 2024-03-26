export interface CardM {
  id: string;
  published: boolean;
  name: string;
  manaCost?: string;
  colorIdentity?: string;
  imageUrl: Array<string>;
  type: string;
  subtype?: string;
  rarity: string;
  set: string;
  text: Array<string>;
  flavorText?: string;
  power?: string;
  toughness?: string;
  loyalty?: number;
}
