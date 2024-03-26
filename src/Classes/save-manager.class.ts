import { CardM } from "../Models/card.model";

export class SaveManager {
  protected static KEY: string = "mtg-cards";

  static saveToLocalStorage(cards: Array<CardM>): void {
    localStorage.setItem(this.KEY, JSON.stringify(cards));
  }
  static loadFromLocalStorage(): Array<CardM> {
    const cardsString: string | null = localStorage.getItem(this.KEY);
    if (cardsString !== null) return JSON.parse(cardsString);
    return [];
  }
  static exportToFile(cards: Array<CardM>): void {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cards));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "mtg-card-database.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
  static async importFromFile(): Promise<Array<CardM>> {
    let data: Array<CardM> = [];
    try {
      const response = await fetch(`/mtg-card-database.json`);
      data = await response.json();
    } catch {
      console.error("Couldn't load data, try running: npm run create-database");
    }
    return data;
  }
}
