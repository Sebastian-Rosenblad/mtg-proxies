import { CardM } from "../card.model";
import { PrintDataM } from "../print-data.model";
import { SetM } from "../set.model";

export interface PrintPropsM {
  cards: Array<CardM>;
  sets: Array<SetM>;
  print: (printData: Array<PrintDataM>) => void;
}
