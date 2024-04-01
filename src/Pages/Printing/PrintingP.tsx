import React, { useEffect, useState } from "react";
import './PrintingP.scss';
import { PrintingPropsM } from "../../Models/Pages/printing-props.model";
import { CardC } from "../../Components/Card/CardC";
import { getCardsSet } from "../../Functions/card.functions";
import { CardM } from "../../Models/card.model";

interface ItemDataM {
  card: CardM;
  illustration: number;
}

export function PrintingP(props: PrintingPropsM): JSX.Element {
  const { printData, sets } = props;
  const [page, setPage] = useState<number>(0);
  const items: Array<ItemDataM> = printData.flatMap(item => 
    item.amount.map((count, illustration) => 
      Array(count).fill({}).map((): ItemDataM => ({
        card: item.card,
        illustration: illustration
      }))
    )
  ).flat();

  const totalPages = Math.ceil(items.length / 9);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
          setPage((prevPage) => Math.min(prevPage + 1, totalPages - 1));
          break;
        case 'ArrowLeft':
          setPage((prevPage) => Math.max(prevPage - 1, 0));
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [totalPages]);

  return <div className="printing">
    {items.slice(page * 9, (page + 1) * 9).map((item, i) =>
      <CardC
        key={item.card.id + "-" + item.illustration + "-" + i}
        card={item.card}
        set={getCardsSet(item.card, sets)}
        illustration={item.illustration}
      />
    )}
  </div>;
}
