import { CardM } from "../card.model";

export interface HomePagePropsM {
  cards: Array<CardM>;
  createCard: () => void;
  editCard: (card: CardM) => void;
  deleteCard?: (card: CardM) => void;
}
