import { CardM } from "../card.model";
import { SetM } from "../set.model";

export interface PrintPropsM {
  cards: Array<CardM>;
  sets: Array<SetM>;
}
