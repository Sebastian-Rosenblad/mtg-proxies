import { CardM } from "../Models/card.model";
import { FiltersM } from "../Models/filters.model";
import { SetM } from "../Models/set.model";
import { SettingsM } from "../Models/settings.model";
import { AiCardM, GptSettingsM } from "../Pages/ChatGpt/ChatGptP";

export class SaveManager {
  protected static KEY_CARDS: string = "ancinysMTG-cards";
  protected static KEY_SETS: string = "ancinysMTG-sets";
  protected static KEY_FILTERS: string = "ancinysMTG-filters";
  protected static KEY_SETTINGS: string = "ancinysMTG-settings";
  protected static KEY_AI_SETTINGS: string = "ancinysMTG-ai-settings";
  protected static KEY_AI_CARDS: string = "ancinysMTG-ai-cards";
  protected static CARD_DATABASE: string = "mtg-card-database";
  protected static SET_DATABASE: string = "mtg-set-database";

  static saveCardsToLocalStorage(cards: Array<CardM>): void {
    this.saveToLocalStorage(cards, this.KEY_CARDS);
  }
  static saveSetsToLocalStorage(sets: Array<SetM>): void {
    this.saveToLocalStorage(sets, this.KEY_SETS);
  }
  static loadCardsFromLocalStorage(): Array<CardM> {
    return this.loadFromLocalStorage(this.KEY_CARDS);
  }
  static loadSetsFromLocalStorage(): Array<SetM> {
    return this.loadFromLocalStorage(this.KEY_SETS);
  }
  static exportCardsToFile(cards: Array<CardM>): void {
    this.exportToFile(cards, this.CARD_DATABASE);
  }
  static exportSetsToFile(sets: Array<SetM>): void {
    this.exportToFile(sets, this.SET_DATABASE);
  }
  static async importCardsFromFile(): Promise<Array<CardM>> {
    return this.importFromFile(this.CARD_DATABASE);
  }
  static async importSetsFromFile(): Promise<Array<SetM>> {
    return this.importFromFile(this.SET_DATABASE);
  }

  private static saveToLocalStorage(data: Array<any>, key: string) {
    localStorage.setItem(key, JSON.stringify(data));
  }
  private static loadFromLocalStorage(key: string): Array<any> {
    const loadString: string | null = localStorage.getItem(key);
    if (loadString !== null) return JSON.parse(loadString);
    return [];
  }
  private static exportToFile(data: Array<any>, fileName: string): void {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", fileName + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
  private static async importFromFile(fileName: string): Promise<Array<any>> {
    let data: Array<any> = [];
    try {
      const response = await fetch("/" + fileName + ".json");
      data = await response.json();
    } catch {
      console.error("Couldn't load data from " + fileName + ".json");
    }
    return data;
  }

  static saveFilters(filters: FiltersM): void {
    localStorage.setItem(this.KEY_FILTERS, JSON.stringify(filters));
  }
  static loadFilters(): FiltersM {
    const loadString: string | null = localStorage.getItem(this.KEY_FILTERS);
    if (loadString !== null) return JSON.parse(loadString);
    return {} as FiltersM;
  }

  static saveSettings(settings: SettingsM) {
    localStorage.setItem(this.KEY_SETTINGS, JSON.stringify(settings));
  }
  static loadSettings(): SettingsM {
    const loadString: string | null = localStorage.getItem(this.KEY_SETTINGS);
    if (loadString !== null) return JSON.parse(loadString);
    return {} as SettingsM;
  }

  static saveChatGptSettings(settings: GptSettingsM) {
    localStorage.setItem(this.KEY_AI_SETTINGS, JSON.stringify(settings));
  }
  static loadChatGptSettings(): GptSettingsM {
    const loadString: string | null = localStorage.getItem(this.KEY_AI_SETTINGS);
    if (loadString !== null) return JSON.parse(loadString);
    return {} as GptSettingsM;
  }
  static saveChatGptCards(cards: Array<AiCardM>) {
    localStorage.setItem(this.KEY_AI_CARDS, JSON.stringify(cards));
  }
  static loadChatGptCards(): Array<AiCardM> {
    const loadString: string | null = localStorage.getItem(this.KEY_AI_CARDS);
    if (loadString !== null) return JSON.parse(loadString);
    return [];
  }
  static clearChatGptData() {
    localStorage.removeItem(this.KEY_AI_SETTINGS);
    localStorage.removeItem(this.KEY_AI_CARDS);
  }
}
