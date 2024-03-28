import { CardM } from "../card.model";

export interface EditPagePropsM {
  card: CardM;
  saveCard: (newCard: CardM) => void;
  stopEditing: () => void;
  deleteCard?: (card: CardM) => void;
}
