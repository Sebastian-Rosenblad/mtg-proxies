import React, { useState } from "react";
import './EditP.scss';
import { CardC } from "../../Components/Card/CardC";
import { EditPagePropsM } from "../../Models/Pages/edit-props.model";

export function EditP(props: EditPagePropsM): JSX.Element {
  const { card, saveCard, stopEditing } = props;
  const [editedCard, setEditedCard] = useState({ ...card });
  const [illustration, setIllustration] = useState<number>(0);

  function handleChange(evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = evt.target;
    setEditedCard(prev => ({ ...prev, [name]: value }));
  }
  function handleSave() {
    saveCard(editedCard);
  }

  return <div className="edit">
    <div className="edit--content">
      <div className="edit--content--item">
        <label>Name</label>
        <input type="text" name="name" value={editedCard.name} onChange={handleChange} />
      </div>
      <div className="edit--content--item">
        <label>Mana cost</label>
        <input type="text" name="manaCost" value={editedCard.manaCost || ''} onChange={handleChange} />
      </div>
      <div className="edit--content--item">
        <label>Color identity</label>
        <input type="text" name="colorIdentity" value={editedCard.color || ''} onChange={handleChange} />
      </div>
      <div className="edit--content--item">
        <label>Image variations</label>
        <div className="edit--content--item--array">
          {editedCard.illustrations.map((line, index) => (
            <div key={index} className="edit--content--item--array--item">
              <input
                type="text"
                name={`imageUrl-${index}`}
                value={line}
                onChange={(evt) => {
                  const newImages = [...editedCard.illustrations];
                  newImages[index] = evt.target.value;
                  setEditedCard(prev => ({ ...prev, imageUrl: newImages }));
                }}
              />
              <button onClick={() => {
                const newImages = [...editedCard.illustrations];
                newImages.splice(index, 1);
                setEditedCard(prev => ({ ...prev, imageUrl: newImages }));
              }}>Remove</button>
            </div>
          ))}
          <button onClick={() => {
            const newImages = [...editedCard.illustrations, "Image url"];
            setEditedCard(prev => ({ ...prev, imageUrl: newImages }));
          }}>Add Variation</button>
        </div>
      </div>
      <div className="edit--content--item">
        <label>Type</label>
        <input type="text" name="type" value={editedCard.type} onChange={handleChange} />
      </div>
      <div className="edit--content--item">
        <label>Subtype</label>
        <input type="text" name="subtype" value={editedCard.subtype || ''} onChange={handleChange} />
      </div>
      <div className="edit--content--item">
        <label>Rarity</label>
        <input type="text" name="rarity" value={editedCard.rarity} onChange={handleChange} />
      </div>
      <div className="edit--content--item">
        <label>Set</label>
        <input type="text" name="set" value={editedCard.set} onChange={handleChange} />
      </div>
      <div className="edit--content--item">
        <label>Abilities</label>
        <div className="edit--content--item--array">
          {editedCard.text.map((line, index) => (
            <div key={index} className="edit--content--item--array--item">
              <input
                type="text"
                name={`text-${index}`}
                value={line}
                onChange={(evt) => {
                  const newText = [...editedCard.text];
                  newText[index] = evt.target.value;
                  setEditedCard(prev => ({ ...prev, text: newText }));
                }}
              />
              <button onClick={() => {
                const newText = [...editedCard.text];
                newText.splice(index, 1);
                setEditedCard(prev => ({ ...prev, text: newText }));
              }}>Remove</button>
            </div>
          ))}
          <button onClick={() => {
            const newText = [...editedCard.text, "New ability"];
            setEditedCard(prev => ({ ...prev, text: newText }));
          }}>Add Ability</button>
        </div>
      </div>
      <div className="edit--content--item">
        <label>Flavor text</label>
        <textarea name="flavorText" value={editedCard.flavorText || ''} onChange={handleChange} />
      </div>
      <div className="edit--content--item">
        <label>Power</label>
        <input type="text" name="power" value={editedCard.power || ''} onChange={handleChange} />
      </div>
      <div className="edit--content--item">
        <label>Toughness</label>
        <input type="text" name="toughness" value={editedCard.toughness || ''} onChange={handleChange} />
      </div>
      <div className="edit--content--item">
        <label>Loyalty</label>
        <input type="number" name="loyalty" value={editedCard.loyalty || ''} onChange={handleChange} />
      </div>
      <div className="edit--content--item">
        <button onClick={handleSave}>Save</button>
        <button onClick={stopEditing}>Cancel</button>
      </div>
    </div>
    <div className="edit--card">
      <CardC card={editedCard} illustration={illustration} updateIllustration={setIllustration} />
    </div>
  </div>;
}
