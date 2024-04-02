import React, { useEffect, useState } from 'react';
import './App.scss';
import { Link, NavigateFunction, Route, Routes, useNavigate } from 'react-router-dom';
import { HomeP } from './Pages/Home/HomeP';
import { EditP } from './Pages/Edit/EditP';
import { SetsP } from './Pages/Sets/SetsP';
import { CardM } from './Models/card.model';
import { colorKeys, createNewCard } from './Functions/card.functions';
import { SaveManager } from './Classes/save-manager.class';
import { SetM } from './Models/set.model';
import { PrintP } from './Pages/Print/PrintP';
import { PrintDataM } from './Models/print-data.model';
import { PrintingP } from './Pages/Printing/PrintingP';
import { AiCardM, ChatGptP } from './Pages/ChatGpt/ChatGptP';
import { getNewId } from './Functions/utils';

function App() {
  const [cards, setCards] = useState<Array<CardM>>(SaveManager.loadCardsFromLocalStorage());
  const [sets, setSets] = useState<Array<SetM>>(SaveManager.loadSetsFromLocalStorage());
  const [editCard, setEditCard] = useState<CardM | undefined>(undefined);
  const [printData, setPrintData] = useState<Array<PrintDataM>>([]);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  let navigate: NavigateFunction = useNavigate();

  useEffect(() => {
    if (SaveManager.loadChatGptCards().length > 0) navigate('/chatgpt/');
  }, []);

  useEffect(() => {
    if (editCard !== undefined) navigate('/edit/');
    else navigate('/');
  }, [editCard]);
  
  useEffect(() => {
    if (printData.length > 0) navigate('/printing/');
    else navigate('/');
  }, [printData]);

  function importCardsFromFile() {
    SaveManager.importCardsFromFile().then((importedCards: Array<CardM>) => {
      setCards(importedCards);
    }).catch(error => {
      console.error("Failed to load cards: " + error);
    });
  }
  function exportCardsToFile() {
    SaveManager.exportCardsToFile(cards);
  }
  function importSetsFromFile() {
    SaveManager.importSetsFromFile().then((importedSets: Array<SetM>) => {
      setSets(importedSets);
    }).catch(error => {
      console.error("Failed to load sets: " + error);
    });
  }
  function exportSetsToFile() {
    SaveManager.exportSetsToFile(sets);
  }

  function createCard() {
    const newCard: CardM = createNewCard(cards.map(card => card.id));
    setCards([...cards, newCard]);
    setEditCard(newCard);
  }
  function startEditingCard(card: CardM) {
    setEditCard(card);
  }
  function saveCard(savedCard: CardM) {
    const newCards: Array<CardM> = cards.map(card => card.id === savedCard.id ? savedCard : card);
    setCards(newCards);
    SaveManager.saveCardsToLocalStorage(newCards);
  }
  function stopEditingCard() {
    setEditCard(undefined);
  }
  function deleteCard(cardToDelete: CardM) {
    const newCards: Array<CardM> = cards.filter(card => card.id !== cardToDelete.id);
    setEditCard(undefined);
    setCards(newCards);
    SaveManager.saveCardsToLocalStorage(newCards);
  }

  function updateSets(newSets: Array<SetM>) {
    setSets(newSets);
    SaveManager.saveSetsToLocalStorage(newSets);
  }

  function addAiCards(aiCards: Array<AiCardM>, setName: string, color: string) {
    const set: SetM = { id: getNewId(sets.map(s => s.id)), name: setName, icon: "default" };
    let newCards: Array<CardM> = [...cards];
    let ids: Array<string> = newCards.map(card => card.id);
    aiCards.slice(0, -3).forEach(aiCard => {
      const newID: string = getNewId(ids);
      ids.push(newID);
      let newCard: CardM = {
        id: newID,
        name: aiCard.name,
        illustrations: [aiCard.imgPath],
        type: aiCard.type,
        rarity: aiCard.rarity,
        set: set.id,
        text: aiCard.text
      }
      if (aiCard.manaValue && aiCard.manaValue.length > 0) newCard.manaCost = aiCard.manaValue;
      if (aiCard.type.includes("Land") && !aiCard.type.includes("Basic")) newCard.color = [color.toLocaleLowerCase()];
      if (aiCard.subtype) newCard.subtype = aiCard.subtype;
      if (aiCard.flavorText) newCard.flavorText = aiCard.flavorText;
      if (aiCard.power) newCard.power = aiCard.power;
      if (aiCard.toughness) newCard.toughness = aiCard.toughness;
      newCards.push(newCard);
    });
    newCards.push({
      id: getNewId(ids),
      name: colorKeys[color.toLocaleLowerCase()].land,
      illustrations: aiCards.slice(-3).map(c => c.imgPath),
      type: "Basic Land",
      subtype: colorKeys[color.toLocaleLowerCase()].land,
      rarity: "Common",
      set: set.id,
      text: []
    });
    setSets([...sets, set]);
    setCards(newCards);
    SaveManager.saveSetsToLocalStorage([...sets, set]);
    SaveManager.saveCardsToLocalStorage(newCards);
    SaveManager.clearChatGptData();
    navigate('/');
  }
  
  return (
    <div className="App">
      <div className="App--header">
        <nav className="App--header--navigation">
          <Link to='/'><button>Home</button></Link>
          <Link to='/sets/'><button>Sets</button></Link>
          <Link to='/print/'><button>Print</button></Link>
          <Link to='/chatgpt/'><button>ChatGPT</button></Link>
        </nav>
        <div className="App--header--settings">
          <button onClick={() => setShowSettings(!showSettings)}>Settings</button>
          {showSettings && <div className="App--header--settings--content">
            <button onClick={importCardsFromFile}>Load cards from file</button>
            <button onClick={exportCardsToFile}>Save cards to file</button>
            <button onClick={importSetsFromFile}>Load sets from file</button>
            <button onClick={exportSetsToFile}>Save sets to file</button>
          </div>}
        </div>
      </div>
      <Routes>
        <Route path='/' element={
          <HomeP
            cards={cards}
            sets={sets}
            createCard={createCard}
            editCard={startEditingCard}
          />
        } />
        <Route path='/edit/' element={ editCard !== undefined &&
          <EditP
            card={editCard}
            sets={sets}
            saveCard={saveCard}
            stopEditing={stopEditingCard}
            deleteCard={deleteCard}
          />
        } />
        <Route path='/sets/' element={
          <SetsP
            sets={sets}
            updateSets={updateSets}
          />
        } />
        <Route path='/print/' element={
          <PrintP
            cards={cards}
            sets={sets}
            print={setPrintData}
          />
        } />
        <Route path='/printing/' element={
          <PrintingP
            printData={printData}
            sets={sets}
          />
        } />
        <Route path='/chatgpt/' element={
          <ChatGptP
            addCards={addAiCards}
          />
        } />
      </Routes>
    </div>
  );
}

export default App;
