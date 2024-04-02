import { CardM } from "../card.model";
import { SetM } from "../set.model";

export interface CardComponentPropsM {
  card: CardM;
  set: SetM;
  illustration?: number;
  updateIllustration?: (newIllustration: number) => void;
  forPrint?: boolean;
  usingRef?: (node: HTMLImageElement) => void;
}
