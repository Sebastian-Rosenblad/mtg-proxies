import { CardM } from "../card.model";

export interface CardComponentPropsM {
  card: CardM;
  variation?: number;
  updateVariation?: (newVariation: number) => void;
}
