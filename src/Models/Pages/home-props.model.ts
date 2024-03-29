import { CardM } from "../card.model";
import { SetM } from "../set.model";

export interface HomePagePropsM {
  cards: Array<CardM>;
  sets: Array<SetM>;
  createCard: () => void;
  editCard: (card: CardM) => void;
  deleteCard?: (card: CardM) => void;
}
