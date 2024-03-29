import { CardM } from "../card.model";
import { SetM } from "../set.model";

export interface EditPagePropsM {
  card: CardM;
  sets: Array<SetM>;
  saveCard: (newCard: CardM) => void;
  stopEditing: () => void;
  deleteCard?: (card: CardM) => void;
}
