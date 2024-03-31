import React, { useEffect, useState } from 'react';
import './App.scss';
import { Link, NavigateFunction, Route, Routes, useNavigate } from 'react-router-dom';
import { HomeP } from './Pages/Home/HomeP';
import { EditP } from './Pages/Edit/EditP';
import { SetsP } from './Pages/Sets/SetsP';
import { CardM } from './Models/card.model';
import { createNewCard } from './Functions/card.functions';
import { SaveManager } from './Classes/save-manager.class';
import { SetM } from './Models/set.model';
import { PrintP } from './Pages/Print/PrintP';

function App() {
  const [cards, setCards] = useState<Array<CardM>>(SaveManager.loadCardsFromLocalStorage());
  const [sets, setSets] = useState<Array<SetM>>(SaveManager.loadSetsFromLocalStorage());
  const [editCard, setEditCard] = useState<CardM | undefined>(undefined);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  let navigate: NavigateFunction = useNavigate();

  useEffect(() => {
    if (editCard !== undefined) navigate('/edit/');
    else navigate('/');
  }, [editCard]);

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
  
  return (
    <div className="App">
      <div className="App--header">
        <nav className="App--header--navigation">
          <Link to='/'><button>Home</button></Link>
          <Link to='/sets/'><button>Sets</button></Link>
          <Link to='/print/'><button>Print</button></Link>
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
          />
        } />
      </Routes>
    </div>
  );
}

export default App;
