import { CardM } from "../card.model";

export interface CardLinePropsM {
  card: CardM;
  editCard: () => void;
  deleteCard?: () => void;
}
