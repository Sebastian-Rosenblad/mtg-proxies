import { CardM } from "../card.model";
import { SetM } from "../set.model";

export interface CardLinePropsM {
  card: CardM;
  set: SetM;
  illustration?: number;
  selectCard?: () => void;
  deleteCard?: () => void;
}
