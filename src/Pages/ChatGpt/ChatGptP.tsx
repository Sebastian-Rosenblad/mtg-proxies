import React, { useEffect, useState } from "react";
import './ChatGptP.scss';
import { ChatGptPropsM } from "../../Models/Pages/chat-gpt-props.model";
import { InputDropDownC } from "../../Components/InputDropDown/InputDropDownC";
import { InputTextC } from "../../Components/InputText/InputTextC";
import { CardM } from "../../Models/card.model";
import { CardC } from "../../Components/Card/CardC";
import { SaveManager } from "../../Classes/save-manager.class";
import { SetM } from "../../Models/set.model";

export interface GptSettingsM {
  color: "White" | "Blue" | "Black" | "Red" | "Green";
  theme: string;
  inspiration: string;
  mechanics: string;
}
interface InspirationResponseM {
  name: string;
  type: string;
  desc: string;
}
interface InspirationM {
  name: string;
  type: string;
  desc: string;
  comment: string;
}
export interface AiCardM {
  name: string;
  manaValue: string;
  type: string;
  subtype?: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Mythic";
  text: Array<string>;
  flavorText?: string;
  power?: string;
  toughness?: string;
  prompt: string;
  imgPath: string;
}
interface FlavorResponseM {
  name: string;
  flavorText: string;
}
interface PromptResponseM {
  name: string;
  prompt: string;
}

const landNames = {
  White: { thrive: "Thriving Heath", basic: "Basic Plains", basics: "Basic Plains", icon: "{W}", flavor: "Wildflowers here bloom not with the season but with the ebb and flow of magic." },
  Blue: { thrive: "Thriving Isle", basic: "Basic Island", basics: "Basic Islands", icon: "{U}", flavor: "All the wonders of the natural world in one breathtaking microcosm." },
  Black: { thrive: "Thriving Moor", basic: "Basic Swamp", basics: "Basic Swamps", icon: "{B}", flavor: "Beauty appears in strange places for those with eyes to see it." },
  Red: { thrive: "Thriving Bluff", basic: "Basic Mountain", basics: "Basic Mountains", icon: "{R}", flavor: "As eons passed, the rock wore away, revealing the rich colors at the mountain's heart." },
  Green: { thrive: "Thriving Grove", basic: "Basic Forest", basics: "Basic Forests", icon: "{G}", flavor: "Far from human eyes, birds flit between vivid blossoms in a hidden paradise." }
}

export function ChatGptP(props: ChatGptPropsM): JSX.Element {
  const [settings, setSettings] = useState<GptSettingsM>(SaveManager.loadChatGptSettings());
  const [set, setSet] = useState<SetM>({ id: "", name: "", icon: "default" });
  const [step, setStep] = useState<number>(0);
  const [inspiration, setInspiration] = useState<Array<InspirationM>>([]);
  const [aiCards, setAiCards] = useState<Array<AiCardM>>(SaveManager.loadChatGptCards());
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [response, setResponse] = useState<string>("");
  const [dimensions, setDimensions] = useState<string>("1:1");
  const { addCards } = props;

  useEffect(() => {
    if (step === 0 && aiCards.length > 0) setStep(10);
  }, [aiCards]);

  function copyStepOne() {
    const clip: string = `Hi! I would like your help in creating a few Magic the Gathering cards. I would like to create a mono ${settings.color} Jumpstart pack list of 20 cards. The theme should be ${settings.theme}. It should be heavily inspired by ${settings.inspiration}. The main mechanics of this pack should be ${settings.mechanics}. Could you please lay out the basic structure of our pack?

In this initial structure, only include the unique cards of this pack. I will add the thriving land and basic lands after we are done. So please generate 13 cards if it is a very fast pased pack, otherwise only generate 12 cards. Very few packs has a unique land, but if you see a land fit perfectlly into this pack you can add 1 extra card for that unique land.

This initial structure is for inspiration, so give me a description of why it fits in this pack and maybe which mechanic(s) it would entail. Don't write what the card will do, we will do that in a later stage. Please give me these cards in a JSON format that follows this model, thanks a lot!!!

interface InspirationM {
  name: string;
  type: string;
  desc: string;
}`;
    navigator.clipboard.writeText(clip).then(() => setStep(1));
  }
  function parseStepOne() {
    try {
      const value: Array<InspirationResponseM> = JSON.parse(response);
      setInspiration(value.map(item => ({ ...item, comment: "" })));
      setResponse("");
      if (step < 4) setStep(2);
      else {
        copyStepFour();
        setStep(5);
      }
    } catch {
      console.error("Error parsing inspiration");
    }
  }
  function copyStepTwo() {
    const clip: string = `Those are some great cards, thanks! I have a few comments on some of the cards:

${inspiration.filter(item => item.comment.length > 0).map(item => item.name + ": " + item.comment).join(`
`)}

If the card type has change, please update the name of the card to better fit the new type.

Could you update the JSON file from these comments? Thanks!!!`;
    navigator.clipboard.writeText(clip).then(() => setStep(3));
  }
  function copyStepThree() {
    const clip: string = `Awesome! As for the final part of creating the structure, could you rank these cards from should be most powerful/most interesting (first position) to should be least powerful/least interesting (final position)? Which card really encapsulates this pack and should therefore be the signature card? That card should take the number one spot. Please give me an updated JSON file with the final rankings. Thanks!`;
    navigator.clipboard.writeText(clip).then(() => setStep(4));
  }
  function copyStepFour() {
    const clip: string = `Perfect! Now let's take this inspiration and turn it into fully working cards. Let's begin with these:

${inspiration[0].name}: This is the signature card and should be either a Rare or Mythic card, depending on how strong it is. Please keep this in mind when creating the card. Don't forget the inspiration: ${inspiration[0].desc}
${inspiration[1].name}: This is the second most interesting card and should be either an Uncommon or Rare card, depending on how strong it is. Don't forget the inspiration: ${inspiration[1].desc}
${inspiration.slice(2, 6).map(item => item.name + ": This is should be an Uncommon card, not boring, but not to powerful. Don't forget the inspiration: " + item.desc).join(`
`)}

Could you please give me the final cards in a JSON file that follows this model? Thanks!!!

interface CardM {
  name: string;
  manaValue: string;// Use this format please: "{X}{2}{G}{W}"
  type: string;
  subtype?: string;// Don't use subtypes for anything except creatures please
  rarity: "Common" | "Uncommon" | "Rare" | "Mythic";
  text: Array<string>;// Please put each line break into a new string in the array.
  power?: string;
  toughness?: string;
}`;
    navigator.clipboard.writeText(clip);
  }
  function parseStepFour() {
    try {
      const value: Array<any> = JSON.parse(response);
      setAiCards([ ...aiCards, ...value.map(item => ({
        ...item,
        prompt: "",
        imgPath: nameToCamelCase(item.name) + "-" + nameToCamelCase(settings.theme)
      } as AiCardM))]);
      setResponse("");
      if (step === 5) {
        copyStepFive();
        setStep(6);
      }
      else setStep(7);
    } catch {
      console.error("Error parsing cards");
    }
  }
  function copyStepFive() {
    const clip: string = `Great! Now let's make the common cards as well. All of these cards are common, and therefore their powers should be mild.

${inspiration.slice(6).map(item => item.name + ": " + item.desc).join(`
`)}

Please give me these common cards in their own JSON file using this model:

interface CardM {
  name: string;
  manaValue: string;// Use this format please: "{X}{2}{G}{W}"
  type: string;
  subtype?: string;// Don't use subtypes for anything except creatures please
  rarity: "Common" | "Uncommon" | "Rare" | "Mythic";
  text: Array<string>;// Leave empty array '[]' if card doesn't have an ability
  power?: string;
  toughness?: string;
}`;
    navigator.clipboard.writeText(clip);
  }
  function copyStepSix() {
    const clip: string = `Great! Now could you give me flavor text for each of these cards? 'Short' means 20-50 characters, 'Medium' means 60-120 characters, and 'Long' means 120-240 characters.

${aiCards.filter(card => card.flavorText && card.flavorText !== "None").map(card => card.name + ": " + card.flavorText).join(`
`)}

Give me the flavor text in a JSON format using this module:

interface FlavorTextM {
  name: string;
  flavorText: string;
}`;
    navigator.clipboard.writeText(clip).then(() => setStep(8));
  }
  function parseStepSix() {
    try {
      const values: Array<FlavorResponseM> = JSON.parse(response);
      const newCards: Array<AiCardM> = aiCards.map(card => {
        const flavotText: string | undefined = values.find(value => value.name === card.name)?.flavorText;
        if (flavotText !== undefined && flavotText.length > 0) return { ...card, flavorText: flavotText };
        return card;
      });
      setAiCards(newCards);
      setResponse("");
      copyStepSeven();
      setStep(9);
    } catch {
      console.error("Error parsing flavor text");
    }
  }
  function copyStepSeven() {
    const clip: string = `Lastly, could you write a short propmt for an image generation AI to generate an image for each card? The prompt should contain segments each sererated by commas. Please write a prompt for each of the unique cards as well as 1 prompt for the ${landNames[settings.color].thrive} and 3 prompts for ${landNames[settings.color].basics}. Give me all these prompts in a JSON format using this model:

interface PromptM {
  name: string;// "Basic Land 1", "Basic Land 2" for the basic lands
  prompt: string;
}

Example of a prompt string: "beautiful mountains, nice weather, a river, birds flying"

Please include the overall theme of the pack in the basic land prompts as well, I want these lands to feel like they belong with the rest of the cards. Even though they are clearly basic lands. Thanks!!!`;
    navigator.clipboard.writeText(clip);
  }
  function parseStepSeven() {
    try {
      const values: Array<PromptResponseM> = JSON.parse(response);
      let newCards: Array<AiCardM> = aiCards.map(card => {
        const prompt: string | undefined = values.find(value => value.name === card.name)?.prompt;
        if (prompt !== undefined && prompt.length > 0) return { ...card, prompt: prompt };
        return card;
      });
      newCards.push({
        name: landNames[settings.color].thrive,
        manaValue: "",
        type: "Land",
        rarity: "Common",
        text: [landNames[settings.color].thrive + " enters the battlefield tapped.", "As " + landNames[settings.color].thrive + " enters the battlefield, choose a color other than " + settings.color.toLocaleLowerCase() + ".", "{T}: Add " + landNames[settings.color].icon + " or one mana of the chosen color."],
        flavorText: landNames[settings.color].flavor,
        prompt: values[values.length - 4].prompt,
        imgPath: nameToCamelCase(landNames[settings.color].thrive) + "-" + nameToCamelCase(settings.theme)
      });
      values.slice(-3).forEach((value, i) => newCards.push({
        name: landNames[settings.color].basic,
        manaValue: "",
        type: "Basic Land",
        subtype: landNames[settings.color].basic.split(" ")[1],
        rarity: "Common",
        text: [],
        prompt: value.prompt,
        imgPath: landNames[settings.color].basic.split(" ")[1].toLocaleLowerCase() + "-" + nameToCamelCase(settings.theme) + "_" + (i + 1)
      }));
      setAiCards(newCards);
      setResponse("");
      setStep(10);
      SaveManager.saveChatGptSettings(settings);
      SaveManager.saveChatGptCards(newCards);
    } catch {
      console.error("Error parsing prompts");
    }
  }
  function copyPrompt() {
    const clip: string = aiCards[cardIndex].prompt + ", magic the gathering art --ar " + dimensions;
    navigator.clipboard.writeText(clip);
  }
  function copyPath() {
    const clip: string = aiCards[cardIndex].imgPath;
    navigator.clipboard.writeText(clip);
  }

  function aiToCard(card: AiCardM, index: number): CardM {
    return {
      id: index.toString(),
      name: card.name,
      manaCost: card.manaValue,
      color: [settings.color.toLocaleLowerCase()],
      illustrations: [card.imgPath],
      type: card.type,
      subtype: card.subtype,
      rarity: card.rarity,
      set: "",
      text: card.text,
      flavorText: card.flavorText,
      power: card.power,
      toughness: card.toughness
    }
  }
  function nameToCamelCase(text: string): string {
    return text.replaceAll("'", "").split(/[\s_]+/).map((word, index) => {
      if (index === 0) return word.toLowerCase();
      else return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join('');
  }
  function updateDimensions(node: HTMLImageElement) {
    if (node !== null) {
      setDimensions(node.offsetWidth + ":" + node.offsetHeight);
    }
  }

  function finalize() {
    addCards(aiCards, settings.theme, settings.color);
  }

  return <div className="chat-gpt">
    {step <= 1 && <div className="chat-gpt--inputs">
      <InputDropDownC
        id="chat-gpt--color-picker"
        label="Pack Color"
        options={["White", "Blue", "Black", "Red", "Green"].map(t => { return { value: t, name: t }; })}
        value={settings.color}
        updateValue={(value: string) => setSettings({ ...settings, color: value as 'White' | 'Blue' | 'Black' | 'Red' | 'Green' })}
      />
      <InputTextC
        label="Set name"
        desc="Name of the set, also used as a theme, like: Haunted Mansion or Rollercoaster (use one or two words)"
        name="theme"
        value={settings.theme}
        updateValue={(value: string) => setSettings({ ...settings, theme: value })}
      />
      <InputTextC
        label="Inspiration"
        desc="Anything to be inspired by, like: Harry Potter, Trees, or Programming (use 1-3 things)"
        name="inspiration"
        value={settings.inspiration}
        updateValue={(value: string) => setSettings({ ...settings, inspiration: value })}
      />
      <InputTextC
        label="Mechanics"
        desc="Keywords or mechanics that should be extra prelevant in this pack, like: Healing, Burn, Trample, or Sacrifice (use 1-3 things)"
        name="mechanics"
        value={settings.mechanics}
        updateValue={(value: string) => setSettings({ ...settings, mechanics: value })}
      />
      <button onClick={copyStepOne}>Generate Jumpstart Pack!</button>
      {step === 1 && <p>Text copied to clipboard, paste into a new ChatGPT chat! Then paste the contents of the code block below <i>(press Copy code in the top right on the code block)</i>:</p>}
      {step === 1 && <textarea value={response} onChange={(evt) => setResponse(evt.target.value)}></textarea>}
      {step === 1 && response.length > 0 && <button onClick={parseStepOne}>Parse response</button>}
    </div>}
    {(step >= 2 && step <= 4) && <div className="chat-gpt--inputs">
      <div className="chat-gpt--inputs--columns">
        {inspiration.map((item, i) => <div key={"card-" + i} className="chat-gpt--inputs--columns--item">
          <h3>{item.name} - {item.type}</h3>
          <p>{item.desc}</p>
          <InputTextC
            label="Comment"
            desc="If you want to change something about this card, write what you would like to change here."
            name="comment"
            value={item.comment}
            updateValue={(comment: string) => setInspiration(inspiration.map((v, index) => i === index ? { ...item, comment: comment } : v))}
          />
        </div>)}
      </div>
      <div className="chat-gpt--inputs--buttons">
        <button onClick={copyStepTwo}>Copy comments</button>
        <button onClick={copyStepThree}>Next step</button>
      </div>
      {step > 2 && <p>Text copied to clipboard, paste into the ChatGPT chat! Then paste the contents of the code block below <i>(press Copy code in the top right on the code block)</i>:</p>}
      {step > 2 && <textarea value={response} onChange={(evt) => setResponse(evt.target.value)}></textarea>}
      {step > 2 && response.length > 0 && <button onClick={parseStepOne}>Parse response</button>}
    </div>}
    {(step >= 5 && step <= 6) && <div className="chat-gpt--inputs">
      <ul>
        {aiCards.map((card, i) => <li key={"card-list-item-" + i}>{card.name}</li>)}
      </ul>
      <p>New text copied to clipboard, paste into the ChatGPT chat! Then paste the contents of the code block below <i>(press Copy code in the top right on the code block)</i>:</p>
      <textarea value={response} onChange={(evt) => setResponse(evt.target.value)}></textarea>
      <div className="chat-gpt--inputs--buttons">
        <button onClick={step === 5 ? copyStepFour : copyStepFive}>Copy again</button>
        {response.length > 0 && <button onClick={parseStepFour}>Parse response</button>}
      </div>
    </div>}
    {(step >= 7 && step <= 8) && <div className="chat-gpt--inputs">
      {aiCards.map((card, i) => <div key={"card-" + i} className="chat-gpt--inputs--item">
        <InputDropDownC
          id={"flavor-input--" + i}
          label="Flavor text"
          options={["None", "Short", "Medium", "Long"].map(t => { return { name: t, value: t }; })}
          value={card.flavorText || ""}
          updateValue={(value: string) => setAiCards(aiCards.map((c, index) => index === i ? { ...c, flavorText: value } : c))}
        />
        <div className="chat-gpt--inputs--item--card">
          <div className="chat-gpt--inputs--item--card--shrink">
            <CardC card={aiToCard(card, i)} set={set} />
          </div>
        </div>
      </div>)}
      <button onClick={copyStepSix}>Next step</button>
      {step === 8 && <p>Text copied to clipboard, paste into the ChatGPT chat! Then paste the contents of the code block below <i>(press Copy code in the top right on the code block)</i>:</p>}
      {step === 8 && <textarea value={response} onChange={(evt) => setResponse(evt.target.value)}></textarea>}
      {step === 8 && response.length > 0 && <button onClick={parseStepSix}>Parse response</button>}
    </div>}
    {step === 9 && <div className="chat-gpt--inputs">
      <p>Text copied to clipboard, paste into the ChatGPT chat! Then paste the contents of the code block below <i>(press Copy code in the top right on the code block)</i>:</p>
      <textarea value={response} onChange={(evt) => setResponse(evt.target.value)}></textarea>
      <div className="chat-gpt--inputs--buttons">
        <button onClick={copyStepSeven}>Copy again</button>
        {response.length > 0 && <button onClick={parseStepSeven}>Parse response</button>}
      </div>
    </div>}
    {step === 10 && <div className="chat-gpt--inputs">
      <div className="chat-gpt--inputs--buttons">
        {cardIndex > 0 && <button onClick={() => setCardIndex(cardIndex - 1)}>Prev card</button>}
        <button onClick={copyPrompt}>Copy image prompt</button>
        <button onClick={copyPath}>Copy image path</button>
        {cardIndex < aiCards.length - 1 && <button onClick={() => setCardIndex(cardIndex + 1)}>Next card</button>}
        {cardIndex === aiCards.length - 1 && <button onClick={finalize}>Finalize</button>}
      </div>
      <div className="chat-gpt--inputs--item">
        <CardC card={aiToCard(aiCards[cardIndex], 0)} set={set} usingRef={updateDimensions} />
      </div>
    </div>}
  </div>;
}
