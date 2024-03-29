import React, { useEffect, useState } from 'react';
import './App.scss';
import { Link, NavigateFunction, Route, Routes, useNavigate } from 'react-router-dom';
import { HomeP } from './Pages/Home/HomeP';
import { EditP } from './Pages/Edit/EditP';
import { CardM } from './Models/card.model';
import { createNewCard } from './Functions/card.functions';
import { SaveManager } from './Classes/save-manager.class';

function App() {
  const [cards, setCards] = useState<Array<CardM>>(SaveManager.loadFromLocalStorage());
  const [editCard, setEditCard] = useState<CardM | undefined>(undefined);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  let navigate: NavigateFunction = useNavigate();

  useEffect(() => {
    if (editCard !== undefined) navigate('/edit/');
    else navigate('/');
  }, [editCard]);

  function importFromFile() {
    SaveManager.importFromFile().then((importedCards: Array<CardM>) => {
      setCards(importedCards);
    }).catch(error => {
      console.error("Failed to load cards: " + error);
    });
  }
  function exportToFile() {
    SaveManager.exportToFile(cards);
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
    SaveManager.saveToLocalStorage(newCards);
  }
  function stopEditingCard() {
    setEditCard(undefined);
  }
  function deleteCard(cardToDelete: CardM) {
    const newCards: Array<CardM> = cards.filter(card => card.id !== cardToDelete.id);
    setEditCard(undefined);
    setCards(newCards);
    SaveManager.saveToLocalStorage(newCards);
  }
  
  return (
    <div className="App">
      <div className="App--header">
        <nav className="App--header--navigation">
          <Link to='/'><button>Home</button></Link>
        </nav>
        <div className="App--header--settings">
          <button onClick={() => setShowSettings(!showSettings)}>Settings</button>
          {showSettings && <div className="App--header--settings--content">
            <button onClick={importFromFile}>Load from file</button>
            <button onClick={exportToFile}>Save to file</button>
          </div>}
        </div>
      </div>
      <Routes>
        <Route path='/' element={
          <HomeP
            cards={cards}
            createCard={createCard}
            editCard={startEditingCard}
          />
        } />
        <Route path='/edit/' element={ editCard !== undefined &&
          <EditP
            card={editCard}
            saveCard={saveCard}
            stopEditing={stopEditingCard}
            deleteCard={deleteCard}
          />
        } />
      </Routes>
    </div>
  );
}

export default App;
