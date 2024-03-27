import React from "react";
import './CardLineC.scss';
import { CardLinePropsM } from "../../Models/Components/card-line-props.model";
import { getCardColor, getCardStats, getColorIcons } from "../../Functions/card.functions";

export function CardLineC(props: CardLinePropsM): JSX.Element {
  function ToJSX(text: string, key?: string, className?: string): JSX.Element {
    let newtext: string = text.replace(/\((.*?)\)/g, '<i>($1)</i>');
    newtext = newtext.replace(/\{W\}/g, '<span class="inline-icon icon--W"></span>');
    newtext = newtext.replace(/\{U\}/g, '<span class="inline-icon icon--U"></span>');
    newtext = newtext.replace(/\{B\}/g, '<span class="inline-icon icon--B"></span>');
    newtext = newtext.replace(/\{R\}/g, '<span class="inline-icon icon--R"></span>');
    newtext = newtext.replace(/\{G\}/g, '<span class="inline-icon icon--G"></span>');
    newtext = newtext.replace(/\{C\}/g, '<span class="inline-icon icon--C"></span>');
    newtext = newtext.replace(/\{1\}/g, '<span class="inline-icon icon--1"></span>');
    newtext = newtext.replace(/\{2\}/g, '<span class="inline-icon icon--2"></span>');
    newtext = newtext.replace(/\{3\}/g, '<span class="inline-icon icon--3"></span>');
    newtext = newtext.replace(/\{4\}/g, '<span class="inline-icon icon--4"></span>');
    newtext = newtext.replace(/\{T\}/g, '<span class="inline-icon icon--T"></span>');
    return <p key={key} className={className} dangerouslySetInnerHTML={{ __html: newtext }} />;
  }

  return <div className="card-line" onClick={props.editCard}>
    {ToJSX(getColorIcons(getCardColor(props.card)).join(""), undefined, "card-line--color")}
    <p className="card-line--stats">{getCardStats(props.card)}</p>
    <p className="card-line--name">{props.card.name}</p>
    <p className="card-line--type">{props.card.type}</p>
    <button onClick={props.deleteCard}>delete</button>
  </div>;
}
