import { AiCardM } from "../../Pages/ChatGpt/ChatGptP";

export interface ChatGptPropsM {
  addCards: (cards: Array<AiCardM>, setName: string, color: string) => void;
}
