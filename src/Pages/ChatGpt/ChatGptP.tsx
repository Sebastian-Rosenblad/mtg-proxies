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
  const [set] = useState<SetM>({ id: "", name: "", icon: "default" });
  const [step, setStep] = useState<number>(0);
  const [inspiration, setInspiration] = useState<Array<InspirationM>>([]);
  const [aiCards, setAiCards] = useState<Array<AiCardM>>(SaveManager.loadChatGptCards());
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [response, setResponse] = useState<string>("");
  const [dimensions, setDimensions] = useState<string>("1:1");
  const { addCards } = props;

  useEffect(() => {
    if (step === 0 && aiCards.length > 0) setStep(70);
  }, [aiCards]);

  function copyStepOne() {
    const iss: number = Math.floor(Math.pow(Math.random() - 1, 2) * 3.5 + 2.5);
    const isr: number = Math.random() / 2 + .25;
    const instants: number = Math.round(iss * isr);
    const sorcery: number = Math.round(iss * (1 - isr));
    const aes: number = Math.floor(Math.pow(Math.random() - 1, 8) * 2.75 + 1.75) % 4;
    const aer: number = Math.random();
    const enchantments: number = Math.round(aes * aer);
    const artifacts: number = Math.round(aes * (1 - aer));
    const creatures: number = 12 - instants - sorcery - enchantments - artifacts;
    const clip: string = `Hi! I would like your help in creating a few Magic the Gathering cards. I would like to create a mono ${settings.color} Jumpstart pack list of 20 cards. The name and theme of the pack is ${settings.theme}. It should be heavily inspired by ${settings.inspiration}. The main mechanics of this pack is ${settings.mechanics}. Could you please lay out the basic structure of our pack?

In this initial structure, only include the unique cards of this pack, I will add the thriving land and basic lands after we are done. So please generate 13 cards, ${creatures} creatures${instants > 0 ? ", " + instants + " instant" + (instants > 1 ? "s" : "") : ""}${sorcery > 0 ? ", " + sorcery + " sorcer" + (sorcery > 1 ? "ies" : "y") : ""}${enchantments > 0 ? ", " + enchantments + " enchantment" + (enchantments > 1 ? "s" : "") : ""}${artifacts > 0 ? ", " + artifacts + " artifact" + (artifacts > 1 ? "s" : "") : ""}, and 1 land.

This initial structure is for inspiration, so give me a description of why each card fits in this pack and maybe which mechanic(s) the card would entail. Don't write what the card will do, we will do that in a later stage. Please give me these cards in a JSON format that follows this model, thanks a lot!

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
      if (step < 10) setStep(10);
      else if (step < 20) setStep(20);
      else setStep(30);
    } catch {
      console.error("Error parsing response");
    }
  }
  function copyStepTwo() {
    const clip: string = `Those are some great cards! I have some comments on these specific cards:

${inspiration.filter(item => item.comment.length > 0).map(item => item.name + ": " + item.comment).join(`
`)}

If you change the card type from a comment, please update the name of the card so that it better fit the new type.

Could you update the JSON block from these comments? Keep any cards not mentioned here unchanged but still in the JSON block as well. Thanks a lot!`;
    navigator.clipboard.writeText(clip).then(() => setStep(11));
  }
  function copyStepThree() {
    const clip: string = `Awesome! As for the final part of creating the structure, could you rank these cards from: should be most powerful/most interesting (first position) to: should be least powerful/least interesting (final position)? Which card really encapsulates this pack and should therefore be the signature card? That card should take the number one spot. The land should end up in place: ${Math.floor(Math.random() * 12 + 2)}. Please give me an updated JSON block with the final rankings. Thanks!`;
    navigator.clipboard.writeText(clip).then(() => setStep(21));
  }
  function copyStepFour() {
    const clip: string = `Perfect! Now let's take this inspiration and turn it into fully working cards! Let's begin with these:

${inspiration[0].name}: This is the signature card and is a powerful Mythic card. Don't forget the inspiration: ${inspiration[0].desc}

${inspiration[1].name}: This is the second most interesting card and is a powerful Rare card. Don't forget the inspiration: ${inspiration[1].desc}

${inspiration.slice(2, 6).map(item => item.name + ": This is an Uncommon card, not boring, but not to powerful. Don't forget the inspiration: " + item.desc).join(`

`)}

Could you please give me these 6 cards in a JSON block that follows this model below? Thanks!

interface CardM {
  name: string;
  manaValue?: string;// Use this format please: "{X}{2}{G}{W}"
  type: string;
  subtype?: string;// Don't use subtypes for anything except creatures please
  rarity: "Common" | "Uncommon" | "Rare" | "Mythic";
  text: Array<string>;// Please put each line break into a new string in the array.
  power?: string;
  toughness?: string;
}`;
    navigator.clipboard.writeText(clip).then(() => setStep(31));
  }
  function parseStepFour() {
    try {
      const value: Array<any> = JSON.parse(response);
      setAiCards([ ...aiCards, ...value.map(item => ({
        ...item,
        prompt: "",
        imgPath: nameToCamelCase(settings.theme) + "-" + nameToCamelCase(item.name)
      } as AiCardM))]);
      setResponse("");
      if (step < 40) setStep(40);
      else setStep(50);
    } catch {
      console.error("Error parsing cards");
    }
  }
  function copyStepFive() {
    const clip: string = `Great! Now let's make the common cards as well. All of these cards are common, and therefore their powers should be mild, but still play into the theme of the pack.

${inspiration.slice(6).map(item => item.name + ": " + item.desc).join(`

`)}

Please give me these common cards in their own JSON file using this model:

interface CardM {
  name: string;
  manaValue?: string;// Use this format please: "{X}{2}{G}{W}"
  type: string;
  subtype?: string;// Don't use subtypes for anything except creatures please
  rarity: "Common";
  text: Array<string>;// Leave empty array '[]' if card doesn't have an ability
  power?: string;
  toughness?: string;
}`;
    navigator.clipboard.writeText(clip).then(() => setStep(41));
  }
  function copyStepSix() {
    const clip: string = `Great! Now could you give me flavor text for each of these cards?

${aiCards.filter(card => card.flavorText && card.flavorText !== "None").map(card => card.name + ": " + (card.flavorText === "Short" ? "20-60 characters" : card.flavorText === "Medium" ? "60-120 characters" : "120-240 characters")).join(`

`)}

Give me the flavor text for these cards in a JSON format using this module:

interface FlavorTextM {
  name: string;
  flavorText: string;
}`;
    navigator.clipboard.writeText(clip).then(() => setStep(51));
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
      setStep(60);
    } catch {
      console.error("Error parsing flavor text");
    }
  }
  function copyStepSeven() {
    const clip: string = `Lastly, could you write a short propmt for an image generation AI to generate an image for each card? The prompt should contain segments, each sererated by commas. Give me all these prompts in a JSON format using the model below.

${aiCards.map(card => card.name).join(`
`)}
${landNames[settings.color].thrive}
${landNames[settings.color].basic} 1
${landNames[settings.color].basic} 2
${landNames[settings.color].basic} 3

interface PromptM {
  name: string;// "${landNames[settings.color].basic} 1", "${landNames[settings.color].basic} 2" for the basic lands
  prompt: string;
}

Example of a prompt string: "beautiful mountains, nice weather, a river, birds flying"

Please include the overall theme and inspiration of the pack in the basic land prompts as well. I want these lands to feel like they belong with the rest of the cards, even though they are clearly basic lands. Thanks a lot!`;
    navigator.clipboard.writeText(clip).then(() => setStep(61));
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
        imgPath: nameToCamelCase(settings.theme) + "-" + nameToCamelCase(landNames[settings.color].thrive)
      });
      values.slice(-3).forEach((value, i) => newCards.push({
        name: landNames[settings.color].basic,
        manaValue: "",
        type: "Basic Land",
        subtype: landNames[settings.color].basic.split(" ")[1],
        rarity: "Common",
        text: [],
        prompt: value.prompt,
        imgPath: nameToCamelCase(settings.theme) + "-" + landNames[settings.color].basic.split(" ")[1].toLocaleLowerCase() + "_" + (i + 1)
      }));
      setAiCards(newCards);
      setResponse("");
      setStep(70);
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
    {step < 10 && <div className="chat-gpt--step">
      <h3>Step 1: Set the theme</h3>
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
        desc="Anything the cards should be inspired by, like: Harry Potter, Trees, or Programming (use 1-3 things)"
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
      <div className="chat-gpt--step--buttons">
        <button onClick={copyStepOne}>{step === 0 ? "Generate Jumpstart Pack!" : "Copy prompt"}</button>
      </div>
      {step > 0 && <div className="chat-gpt--step--response">
        <p>Text has been copied to your clipboard. Paste it into a <b>new</b> ChatGPT chat and then paste the contents of the generated code block below <i>(press "Copy code" in the top right on the code block)</i>:</p>
        <textarea value={response} onChange={(evt) => setResponse(evt.target.value)}></textarea>
        {response.length > 0 && <button onClick={parseStepOne}>Next step</button>}
      </div>}
    </div>}
    {(step >= 10 && step < 20) && <div className="chat-gpt--step">
      <h3>Step 2: Give feedback</h3>
      <p>In this step you can give feedback to ChatGPT about any or all cards. Just type a comment on how you wish ChatGPT to change that specific card. When you have commented on all cards you wish to change, click on the "Comment on cards"-button at the bottom. If you like all the cards, then simply click on the "Next step"-button instead.</p>
      <div className="chat-gpt--step--columns">
        {inspiration.map((item, i) => <div key={"card-" + i} className="chat-gpt--step--columns--item">
          <h3>{item.name} - {item.type}</h3>
          <p>{item.desc}</p>
          <InputTextC
            label="Comment"
            name="comment"
            value={item.comment}
            updateValue={(comment: string) => setInspiration(inspiration.map((v, index) => i === index ? { ...item, comment: comment } : v))}
          />
        </div>)}
      </div>
      <div className="chat-gpt--step--buttons">
        <button onClick={copyStepTwo}>{step === 10 ? "Comment on cards" : "Copy prompt"}</button>
        <button onClick={() => setStep(20)}>Skip to next step</button>
      </div>
      {step > 10 && <div className="chat-gpt--step--response">
        <p>The comments have been copied to your clipboard. Paste them into the existing ChatGPT chat and then paste the contents of the generated code block below:</p>
        <textarea value={response} onChange={(evt) => setResponse(evt.target.value)}></textarea>
        {response.length > 0 && <button onClick={parseStepOne}>Next step</button>}
      </div>}
    </div>}
    {(step >= 20 && step < 30) && <div className="chat-gpt--step">
      <h3>Step 3: Rank the cards</h3>
      <p>This step doesn't have any settings, instead just press the button below.</p>
      <div className="chat-gpt--step--buttons">
        <button onClick={copyStepThree}>Copy prompt</button>
      </div>
      {step > 20 && <div className="chat-gpt--step--response">
        <p>The prompt has been copied to your clipboard. Paste it into the existing ChatGPT chat and then paste the contents of the generated code block below:</p>
        <textarea value={response} onChange={(evt) => setResponse(evt.target.value)}></textarea>
        {response.length > 0 && <button onClick={parseStepOne}>Next step</button>}
      </div>}
    </div>}
    {(step >= 30 && step < 40) && <div className="chat-gpt--step">
      <h3>Step 4 part 1/2: Create the cards</h3>
      <p>This step doesn't have any settings, instead just press the button below.</p>
      <div className="chat-gpt--step--buttons">
        <button onClick={copyStepFour}>Copy prompt</button>
      </div>
      {step > 30 && <div className="chat-gpt--step--response">
        <p>The prompt has been copied to your clipboard. Paste it into the existing ChatGPT chat and then paste the contents of the generated code block below:</p>
        <textarea value={response} onChange={(evt) => setResponse(evt.target.value)}></textarea>
        {response.length > 0 && <button onClick={parseStepFour}>Next part</button>}
      </div>}
    </div>}
    {(step >= 40 && step < 50) && <div className="chat-gpt--step">
      <h3>Step 4 part 2/2: Create the cards</h3>
      <p>This step still doesn't have any settings, instead just press the button below.</p>
      <div className="chat-gpt--step--buttons">
        <button onClick={copyStepFive}>Copy prompt</button>
      </div>
      {step > 40 && <div className="chat-gpt--step--response">
        <p>The prompt has been copied to your clipboard. Paste it into the existing ChatGPT chat and then paste the contents of the generated code block below:</p>
        <textarea value={response} onChange={(evt) => setResponse(evt.target.value)}></textarea>
        {response.length > 0 && <button onClick={parseStepFour}>Next step</button>}
      </div>}
    </div>}
    {(step >= 50 && step < 60) && <div className="chat-gpt--step">
      <h3>Step 5: Add a bit of flavor</h3>
      <p>In this step you choose the length of the flavor text of the cards. When you have select a length for each card, click on the "Set flavor"-button down below.</p>
      <div className="chat-gpt--step--flavor">
        {aiCards.map((card, i) => <div key={"card-" + i} className="chat-gpt--step--flavor--item">
          <div className="chat-gpt--step--item--card">
            <div className="chat-gpt--step--item--card--shrink">
              <CardC card={aiToCard(card, i)} set={set} />
            </div>
          </div>
          <InputDropDownC
            id={"flavor-input--" + i}
            label="Flavor text"
            options={["None", "Short", "Medium", "Long"].map(t => { return { name: t, value: t }; })}
            value={card.flavorText || ""}
            updateValue={(value: string) => setAiCards(aiCards.map((c, index) => index === i ? { ...c, flavorText: value } : c))}
          />
        </div>)}
      </div>
      <div className="chat-gpt--step--buttons">
        <button onClick={copyStepSix}>{step === 50 ? "Set flavor" : "Copy prompt"}</button>
      </div>
      {step > 50 && <div className="chat-gpt--step--response">
        <p>The flavor has been copied to your clipboard. Paste it into the existing ChatGPT chat and then paste the contents of the generated code block below:</p>
        <textarea value={response} onChange={(evt) => setResponse(evt.target.value)}></textarea>
        {response.length > 0 && <button onClick={parseStepSix}>Next step</button>}
      </div>}
    </div>}
    {(step >= 60 && step < 70) && <div className="chat-gpt--step">
      <h3>Step 6: Prompts for your prompts</h3>
      <p>This step still doesn't have any settings, instead just press the button below.</p>
      <div className="chat-gpt--step--buttons">
        <button onClick={copyStepSeven}>Copy prompt</button>
      </div>
      {step > 60 && <div className="chat-gpt--step--response">
        <p>The prompt has been copied to your clipboard. Paste it into the existing ChatGPT chat and then paste the contents of the generated code block below:</p>
        <textarea value={response} onChange={(evt) => setResponse(evt.target.value)}></textarea>
        {response.length > 0 && <button onClick={parseStepSeven}>Next step</button>}
      </div>}
    </div>}
    {step === 70 && <div className="chat-gpt--step">
      <div className="chat-gpt--step--buttons">
        {cardIndex > 0 && <button onClick={() => setCardIndex(cardIndex - 1)}>Prev card</button>}
        <button onClick={copyPrompt}>Copy Prompt</button>
        <button onClick={copyPath}>Copy Image Path</button>
        {cardIndex < aiCards.length - 1 && <button onClick={() => setCardIndex(cardIndex + 1)}>Next card</button>}
        {cardIndex === aiCards.length - 1 && <button onClick={finalize}>Finalize</button>}
      </div>
      <div className="chat-gpt--step--item">
        <CardC card={aiToCard(aiCards[cardIndex], 0)} set={set} usingRef={updateDimensions} />
      </div>
    </div>}
  </div>;
}
