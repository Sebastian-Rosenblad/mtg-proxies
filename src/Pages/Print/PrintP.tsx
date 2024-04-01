import React, { useState } from "react";
import './PrintP.scss';
import { PrintPropsM } from "../../Models/Pages/print-props.model";
import { CardM } from "../../Models/card.model";
import { SaveManager } from "../../Classes/save-manager.class";
import { FiltersM } from "../../Models/filters.model";
import { FilterC } from "../../Components/Filter/FilterC";
import { CardLineC } from "../../Components/CardLine/CardLineC";
import { getCardsSet } from "../../Functions/card.functions";
import { InputTextC } from "../../Components/InputText/InputTextC";

interface PrintCardM {
  card: CardM;
  amount: Array<string>;
}

export function PrintP(props: PrintPropsM): JSX.Element {
  const { cards, sets } = props;
  const [printingData, setPrintingData] = useState<Array<PrintCardM>>([]);
  const [filters, setFilters] = useState<FiltersM>(SaveManager.loadFilters());

  function filter(card: CardM): boolean {
    if (printingData.find(item => item.card.id === card.id)) return false;
    if (filters.set !== undefined && card.set !== filters.set) return false;
    if (filters.type !== undefined && !(card.type.toLocaleLowerCase().includes(filters.type.toLocaleLowerCase()) || card.subtype?.toLocaleLowerCase().includes(filters.type.toLocaleLowerCase()))) return false;
    return true;
  }

  function addToPrint(card: CardM) {
    setPrintingData([...printingData, { card: card, amount: new Array(card.illustrations.length).fill(0) }]);
  }
  function changeAmount(id: string, index: number, value: string) {
    setPrintingData(printingData.map(item => item.card.id === id ? { ...item, amount: item.amount.map((v, i) => i === index ? value : v) } : item))
  }
  function removeFromPrint(card: CardM) {
    setPrintingData(printingData.filter(item => item.card.id !== card.id));
  }
  function startPrinting() {}

  const numberOfSelectedCards = (): number => printingData.map(item => item.amount.reduce((a, b) => a + parseInt(b), 0)).reduce((a, b) => a + b, 0);

  return <div className="print">
    <div className="print--information">
      <p>{Math.ceil(numberOfSelectedCards() / 9)} pages</p>
      <p>{numberOfSelectedCards() % 9 === 0 ? 0 : 9 - numberOfSelectedCards() % 9} open slots</p>
      <button onClick={startPrinting}>Print selection</button>
    </div>
    <div className="print--printing-cards">
      {printingData.map(item => item.amount.map((amount, i) => <div key={item.card.id + "-" + i} className="print--printing-cards--card">
        <CardLineC card={item.card} set={getCardsSet(item.card, sets)} selectCard={() => removeFromPrint(item.card)} illustration={i} />
        <InputTextC label="Amount" name="amount" value={amount.toString()} updateValue={(value) => changeAmount(item.card.id, i, value)} />
      </div>))}
    </div>
    <div className="print--filters">
      <p>Filter:</p>
      <FilterC
        filters={filters}
        sets={sets}
        updateFilters={setFilters}
      />
    </div>
    <div className="print--all-cards">
      {cards.filter(filter).map(card => <div key={card.id}>
        <CardLineC card={card} set={getCardsSet(card, sets)} selectCard={() => addToPrint(card)} />
      </div>)}
    </div>
  </div>;
}
