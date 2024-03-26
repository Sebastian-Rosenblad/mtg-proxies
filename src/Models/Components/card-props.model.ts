import { CardM } from "../card.model";

export interface CardComponentPropsM {
  card: CardM;
  illustration?: number;
  updateIllustration?: (newIllustration: number) => void;
}
