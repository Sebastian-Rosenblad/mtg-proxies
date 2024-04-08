import React, { useEffect, useState } from "react";
import OpenAI from "openai";
import './ChatGptP.scss';
import { ChatGptPropsM } from "../../Models/Pages/chat-gpt-props.model";
import { InputDropDownC } from "../../Components/InputDropDown/InputDropDownC";
import { InputTextC } from "../../Components/InputText/InputTextC";
import { CardM } from "../../Models/card.model";
import { CardC } from "../../Components/Card/CardC";
import { SaveManager } from "../../Classes/save-manager.class";
import { SetM } from "../../Models/set.model";
import { InputCheckboxC } from "../../Components/InputCheckbox/InputCheckboxC";
import { chatGPTRequest } from "../../Functions/api.functions";

export interface GptSettingsM {
  automatic: boolean;
  color: "White" | "Blue" | "Black" | "Red" | "Green";
  theme: string;
  inspiration: string;
  mechanics: string;
  snowCovered: boolean;
  cardIndex: number;
}
interface ContentsM {
  creatures: number;
  instants: number;
  sorceries: number;
  enchantments: number;
  artifacts: number;
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
interface CommentResponseM {
  prevName: string;
  newName: string;
  type: string;
  desc: string;
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
  White: { thrive: "Heath", basic: "Plains", icon: "{W}", flavor: "Wildflowers here bloom not with the season but with the ebb and flow of magic." },
  Blue: { thrive: "Isle", basic: "Island", icon: "{U}", flavor: "All the wonders of the natural world in one breathtaking microcosm." },
  Black: { thrive: "Moor", basic: "Swamp", icon: "{B}", flavor: "Beauty appears in strange places for those with eyes to see it." },
  Red: { thrive: "Bluff", basic: "Mountain", icon: "{R}", flavor: "As eons passed, the rock wore away, revealing the rich colors at the mountain's heart." },
  Green: { thrive: "Grove", basic: "Forest", icon: "{G}", flavor: "Far from human eyes, birds flit between vivid blossoms in a hidden paradise." }
}
const stepTexts = {
  one: {
    prompt: `I need assistance in crafting a Magic the Gathering Jumpstart pack themed around "[THEME]". This mono [COLOR] pack should consist of 20 cards. It should be heavily inspired by [INSPIRATION]. Could you please lay out the basic structure of our pack?\n\nFor this task, I want to start by defining the unique cards of the pack, excluding basic lands and thriving lands. The pack should include:\n\n* [CREATURES] creatures[INSTANTS][SORCERIES][ENCHANTMENTS][ARTIFACTS]\n* 1 land\n\nEach card needs to be conceptualized with a brief description explaining how it aligns with the "[THEME]" theme and the specific Magic the Gathering mechanics that it would utilize. The main mechanics of this pack are [MECHANICS].`,
    instruction: `Please provide the inspiration in an array of exactlly 13 objects following this JSON format:\n\n[{\n  name: string;\n  type: string;\n  desc: string;\n}]`
  },
  two: {
    prompt: `I have some comments on a few cards:\n\n[COMMENTS]\n\nIf you change the card type from a comment, please update the name of the card so that it better fit the new type.`,
    instruction: `Please provide the inspiration in an array of objects following this JSON format:\n\n[{\n  prevName: string;\n  newName: string;\n  type: string;\n  desc: string;\n}]`
  },
  three: {
    prompt: `As for the final part of creating the structure, could you rank these cards from: should be most powerful/most interesting (first position) to: should be least powerful/least interesting (final position)? Which card really encapsulates this pack and should therefore be the signature card? That card should take the number one spot. The land should end up in place: [LAND].`,
    instruction: `Please provide the rankings in a code block with an array of strings like this:\n\n["card name", "card name", ...]`
  },
  four: {
    prompt: `Now let's take this inspiration and turn it into fully working cards! Let's begin with these:\n\n[CARD_0]: This is the signature card and should be a very powerful Mythic card.\n[CARD_1]: This is the second most interesting card and should be a powerful Rare card.${new Array(4).fill(-1).map((_, i) => `\n[CARD_${i + 2}]: This is an Uncommon card, not boring, but not to powerful.`)}`,
    instruction: `Please provide me these 6 cards in an array of objects following this JSON format:\n\n[{\n  name: string;\n  manaValue?: string;// Use this format please: "{X}{2}{G}{W}"\n  type: string;\n  subtype?: string;// Don't use subtypes for anything except creatures please\n  rarity: "Common" | "Uncommon" | "Rare" | "Mythic";\n  text: Array<string>;// Please put each line break into a new string in the array.\n  power?: string;\n  toughness?: string;\n}]`
  },
  five: {
    prompt: `Now let's make the common cards as well. All of these cards are common, and therefore their powers should be mild, but still play into the theme of the pack.${new Array(7).fill(-1).map((_, i) => `\n[CARD_${i + 6}]`)}`,
    instruction: `Please provide me these 7 cards in an array of objects following this JSON format:\n\n[{\n  name: string;\n  manaValue?: string;// Use this format please: "{X}{2}{G}{W}"\n  type: string;\n  subtype?: string;// Don't use subtypes for anything except creatures please\n  rarity: "Common";\n  text: Array<string>;// Please put each line break into a new string in the array.\n  power?: string;\n  toughness?: string;\n}]`
  },
  six: {
    prompt: `Now could you give me flavor text for each of these cards?\n\n[CARD_FLAVORS]`,
    instruction: `Please provide me flavor texts in an array of objects following this JSON format:\n\n[{\n  name: string;\n  flavorText: string;\n}]`
  },
  seven: {
    prompt: `Lastly, could you write a short propmt for an image generation AI to generate an image for each card? The prompt should contain segments, each sererated by commas. Give me all these prompts in a JSON format using the model below.\n\n[CARD_NAMES][THRIVING_LAND]: This land represents each different basic land type, so take inspiration from most or all of: Plains, Island, Swamp, Mountain, and Forest. But take the most inspiration from the [LAND].\n[LAND] 1\n[LAND] 2\n[LAND] 3\n\nExample of a prompt string: "beautiful mountains, nice weather, a river, birds flying"\n\nPlease include the overall theme and inspiration of the pack in the land prompts as well. I want these lands to feel like they belong with the rest of the cards.`,
    instruction: `Please provide me these prompts in an array of objects following this JSON format:\n\n[{\n  name: string;\n  prompt: string;\n}]`
  }
}

export function ChatGptP(props: ChatGptPropsM): JSX.Element {
  const [settings, setSettings] = useState<GptSettingsM>(SaveManager.loadChatGptSettings());
  const [set] = useState<SetM>({ id: "", name: "", icon: "default" });
  const [step, setStep] = useState<number>(0);
  const [inspiration, setInspiration] = useState<Array<InspirationM>>([]);
  const [aiCards, setAiCards] = useState<Array<AiCardM>>(SaveManager.loadChatGptCards());
  const [cardIndex, setCardIndex] = useState<number>(settings.cardIndex);
  const [response, setResponse] = useState<string>("");
  const [dimensions, setDimensions] = useState<string>("1:1");
  const { addCards } = props;

  useEffect(() => {
    console.log("Inspiration", inspiration);
    if (settings.automatic && step === 5) copyStepThree();
    else if (settings.automatic && step === 25) copyStepFour();
  }, [inspiration]);
  useEffect(() => {
    console.log("Cards", aiCards);
    if (step === 0 && aiCards.length > 0) setStep(70);
    else if (settings.automatic && step === 35) copyStepFive();
    else if (settings.automatic && step === 45) copyStepSix();
    else if (settings.automatic && step === 55) copyStepSeven();
  }, [aiCards]);
  useEffect(() => {
    SaveManager.saveChatGptSettings({ ...settings, cardIndex: cardIndex });
  }, [cardIndex]);

  // COPY STEP 1
  async function copyStepOne() {
    const numOf: ContentsM = getPackContents();
    const prompt: string = stepTexts.one.prompt
      .replaceAll("[THEME]", settings.theme)
      .replace("[COLOR]", settings.color)
      .replace("[INSPIRATION]", settings.inspiration)
      .replace("[MECHANICS]", settings.mechanics)
      .replace("[CREATURES]", numOf.creatures.toString())
      .replace("[INSTANTS]", numOf.instants > 0 ? `\n* ${numOf.instants} instants` : "")
      .replace("[SORCERIES]", numOf.sorceries > 0 ? `\n* ${numOf.sorceries} sorceries` : "")
      .replace("[ENCHANTMENTS]", numOf.enchantments > 0 ? `\n* ${numOf.enchantments} enchantments` : "")
      .replace("[ARTIFACTS]", numOf.artifacts > 0 ? `\n* ${numOf.artifacts} artifacts` : "");
    const instruction: string = stepTexts.one.instruction;
    if (settings.automatic) {
      setStep(5);
      let resp = await chatGPTRequest(prompt, instruction);
      const values: Array<any> = JSON.parse(resp);
      setInspiration(values.map((item: any) => ({ ...item, comment: "" })));
    }
    else {
      navigator.clipboard.writeText(prompt + `\n\n` + instruction).then(() => setStep(1));
    }
  }
  // PARSE STEP 1
  function parseStepOne() {
    try {
      const value: Array<InspirationResponseM> = JSON.parse(response);
      setInspiration(value.map(item => ({ ...item, comment: "" })));
      setResponse("");
      setStep(10);
    } catch {
      console.error("Error parsing response");
    }
  }
  // COPY STEP 2
  function copyStepTwo() {
    const prompt: string = stepTexts.two.prompt.replace("[COMMENTS]", inspiration
      .filter(item => item.comment.length > 0)
      .map(item => item.name + ": " + item.comment)
      .join(`\n`));
    const instruction: string = stepTexts.two.instruction;
    navigator.clipboard.writeText(prompt + `\n\n` + instruction).then(() => setStep(11));
  }
  // PARSE STEP 2
  function parseStepTwo() {
    try {
      const values: Array<CommentResponseM> = JSON.parse(response);
      setInspiration(inspiration.map(item => {
        const newValue: CommentResponseM | undefined = values.find(value => value.prevName === item.name);
        if (newValue !== undefined) return { name: newValue.newName, type: newValue.type, desc: newValue.desc, comment: "" };
        return item;
      }));
      setResponse("");
      setStep(20);
    } catch {
      console.error("Error parsing response");
    }
  }
  // COPY STEP 3
  async function copyStepThree() {
    const prompt: string = stepTexts.three.prompt.replace("[LAND]", Math.floor(Math.random() * 12 + 2).toString());
    const instruction: string = stepTexts.three.instruction;
    if (settings.automatic) {
      setStep(25);
      let resp = await chatGPTRequest(prompt, instruction);
      const values: Array<string> = JSON.parse(resp);
      setInspiration(parsingThree(values));
    }
    else {
      navigator.clipboard.writeText(prompt + `\n\n` + instruction).then(() => setStep(21));
    }
  }
  // PARSE STEP 3
  function parseStepThree() {
    try {
      const values: Array<string> = JSON.parse(response);
      setInspiration(parsingThree(values));
      setResponse("");
      setStep(30);
    } catch {
      console.error("Error parsing response");
    }
  }
  function parsingThree(values: Array<string>): Array<InspirationM> {
    return inspiration.sort((a, b) => values.indexOf(a.name) - values.indexOf(b.name));
  }
  // COPY STEP 4
  async function copyStepFour() {
    let prompt: string = stepTexts.four.prompt;
    for (let i = 0; i < 6; i++) prompt = prompt.replace(`[CARD_${i}]`, inspiration[i].name)
    const instruction: string = stepTexts.four.instruction;
    if (settings.automatic) {
      setStep(35);
      let resp = await chatGPTRequest(prompt, instruction);
      const values: Array<any> = JSON.parse(resp);
      setAiCards(parsingFour(values));
    }
    else {
      navigator.clipboard.writeText(prompt + `\n\n` + instruction).then(() => setStep(31));
    }
  }
  // PARSE STEP 4
  function parseStepFour() {
    try {
      const values: Array<any> = JSON.parse(response);
      setAiCards(parsingFour(values));
      setResponse("");
      if (step < 40) setStep(40);
      else setStep(50);
    } catch {
      console.error("Error parsing cards");
    }
  }
  function parsingFour(values: Array<any>): Array<AiCardM> {
    return [ ...aiCards, ...values.map(item => ({
      ...item,
      manaValue: item.type === "Land" ? "" : item.manaValue,
      prompt: "",
      imgPath: nameToCamelCase(settings.theme) + "-" + nameToCamelCase(item.name)
    } as AiCardM))];
  }
  // COPY STEP 5
  async function copyStepFive() {
    let prompt: string = stepTexts.five.prompt;
    for (let i = 6; i < 13; i++) prompt = prompt.replace(`[CARD_${i}]`, inspiration[i].name)
    const instruction: string = stepTexts.four.instruction;
    if (settings.automatic) {
      setStep(45);
      let resp = await chatGPTRequest(prompt, instruction);
      const values: Array<any> = JSON.parse(resp);
      setAiCards(parsingFour(values));
    }
    else {
      navigator.clipboard.writeText(prompt + `\n\n` + instruction).then(() => setStep(41));
    }
  }
  // COPY STEP 6
  async function copyStepSix() {
    const instruction: string = stepTexts.six.instruction;
    if (settings.automatic) {
      const prompt: string = stepTexts.six.prompt.replace("[CARD_FLAVORS]", aiCards
        .filter(card => card.text.join("<br>").length > 200)
        .map(card => card.name + ": " + (
          card.text.join("<br>").length > 120 ? "20-40 characters" :
          card.text.join("<br>").length > 40 ? "60-120 characters" :
          "120-240 characters"
        ))
        .join(`\n`));
      setStep(55);
      let resp = await chatGPTRequest(prompt, instruction);
      const values: Array<FlavorResponseM> = JSON.parse(resp);
      setAiCards(parsingSix(values));
    }
    else {
      const prompt: string = stepTexts.six.prompt.replace("[CARD_FLAVORS]", aiCards
        .filter(card => card.flavorText && card.flavorText !== "None")
        .map(card => card.name + ": " + (card.flavorText === "Short" ? "20-60 characters" : card.flavorText === "Medium" ? "60-120 characters" : "120-240 characters"))
        .join(`\n`));
      navigator.clipboard.writeText(prompt + `\n\n` + instruction).then(() => setStep(51));
    }
  }
  // PARSE STEP 6
  function parseStepSix() {
    try {
      const values: Array<FlavorResponseM> = JSON.parse(response);
      setAiCards(parsingSix(values));
      setResponse("");
      setStep(60);
    } catch {
      console.error("Error parsing flavor text");
    }
  }
  function parsingSix(values: Array<FlavorResponseM>): Array<AiCardM> {
    return aiCards.map(card => {
      const flavotText: string | undefined = values.find(value => value.name === card.name)?.flavorText;
      if (flavotText !== undefined && flavotText.length > 0) return { ...card, flavorText: flavotText };
      return card.flavorText === "None" ? { ...card, flavorText: undefined } : card;
    });
  }
  // COPY STEP 7
  async function copyStepSeven() {
    const prompt: string = stepTexts.seven.prompt
      .replace("[CARD_NAMES]", aiCards.map(card => card.name).join(`\n`))
      .replace("[THRIVING_LAND]", "Thriving " + landNames[settings.color].thrive)
      .replaceAll("[LAND]", (settings.snowCovered ? "Snow-Covered " : "Basic ") + landNames[settings.color].basic);
    const instruction: string = stepTexts.seven.instruction;
    if (settings.automatic) {
      setStep(65);
      let resp = await chatGPTRequest(prompt, instruction);
      const newCards: Array<AiCardM> = parsingSeven(JSON.parse(resp));
      setAiCards(newCards);
      setStep(70);
      SaveManager.saveChatGptSettings(settings);
      SaveManager.saveChatGptCards(newCards);
    }
    else {
      navigator.clipboard.writeText(prompt + `\n\n` + instruction).then(() => setStep(61));
    }
  }
  // PARSE STEP 7
  function parseStepSeven() {
    try {
      const values: Array<PromptResponseM> = JSON.parse(response);
      const newCards: Array<AiCardM> = parsingSeven(values);
      setAiCards(newCards);
      setResponse("");
      setStep(70);
      SaveManager.saveChatGptSettings(settings);
      SaveManager.saveChatGptCards(newCards);
    } catch {
      console.error("Error parsing prompts");
    }
  }
  function parsingSeven(values: Array<PromptResponseM>): Array<AiCardM> {
    let newCards: Array<AiCardM> = aiCards.map(card => {
      const prompt: string | undefined = values.find(value => value.name === card.name)?.prompt;
      if (prompt !== undefined && prompt.length > 0) return { ...card, prompt: prompt };
      return card;
    });
    newCards.push({
      name: "Thriving " + landNames[settings.color].thrive,
      manaValue: "",
      type: "Land",
      rarity: "Common",
      text: [
        "Thriving " + landNames[settings.color].thrive + " enters the battlefield tapped.",
        "As Thriving " + landNames[settings.color].thrive + " enters the battlefield, choose a color other than " + settings.color.toLocaleLowerCase() + ".",
        "{T}: Add " + landNames[settings.color].icon + " or one mana of the chosen color."
      ],
      flavorText: landNames[settings.color].flavor,
      prompt: values[values.length - 4].prompt,
      imgPath: nameToCamelCase(settings.theme) + "-thriving" + landNames[settings.color].thrive
    });
    values.slice(-3).forEach((value, i) => newCards.push({
      name: settings.snowCovered ? "Snow-Covered " : "Basic " + landNames[settings.color].basic,
      manaValue: "",
      type: settings.snowCovered ? "Basic Snow Land" : "Basic Land",
      subtype: landNames[settings.color].basic,
      rarity: "Common",
      text: [],
      prompt: value.prompt,
      imgPath: nameToCamelCase(settings.theme) + "-basic" + landNames[settings.color].basic + "_" + (i + 1)
    }));
    return newCards;
  }
  function copyImagePrompt() {
    const clip: string = aiCards[cardIndex].name.toLocaleLowerCase() + ", " + aiCards[cardIndex].prompt + ", magic the gathering art --ar " + dimensions;
    navigator.clipboard.writeText(clip);
  }
  function copyImagePath() {
    const clip: string = aiCards[cardIndex].imgPath;
    navigator.clipboard.writeText(clip);
  }

  function getPackContents(): ContentsM {
    const instSorcs: number = Math.floor(Math.pow(Math.random() - 1, 2) * 3.5 + 2.5);
    const instSorcRatio: number = Math.random() / 2 + .25;
    const enchArts: number = Math.floor(Math.pow(Math.random() - 1, 8) * 2.75 + 1.75) % 4;
    const enchArtRatio: number = Math.random();
    let contents = {
      instants: Math.round(instSorcs * instSorcRatio),
      sorceries: Math.round(instSorcs * (1 - instSorcRatio)),
      enchantments: Math.round(enchArts * enchArtRatio),
      artifacts: Math.round(enchArts * (1 - enchArtRatio))
    }
    return {
      ...contents,
      creatures: 12 - contents.instants - contents.sorceries - contents.enchantments - contents.artifacts
    };
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
    {step === 5 && <div className="chat-gpt--step">
      <h3>Step 1: Set the theme</h3>
      <p>Generating inspiration...</p>
    </div>}
    {step < 5 && <div className="chat-gpt--step">
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
        desc="Anything the cards should be inspired by (1 word to a few sentences)."
        name="inspiration"
        value={settings.inspiration}
        updateValue={(value: string) => setSettings({ ...settings, inspiration: value })}
      />
      <InputTextC
        label="Mechanics"
        desc="Keywords or mechanics that should be extra prelevant in this pack, like: Healing, Burn, Trample, or Sacrifice."
        name="mechanics"
        value={settings.mechanics}
        updateValue={(value: string) => setSettings({ ...settings, mechanics: value })}
      />
      <InputCheckboxC
        label="Automatic"
        desc="Turn this on if you don't want to have any influence past this point. The AI will handle everything for you."
        name="automatic"
        value={settings.automatic}
        updateValue={(value: boolean) => setSettings({ ...settings, automatic: value })}
      />
      <div className="chat-gpt--step--buttons">
        <button onClick={copyStepOne}>{step === 0 ? "Generate Jumpstart Pack!" : "Copy prompt again"}</button>
      </div>
      {step > 0 && <div className="chat-gpt--step--response">
        <p>Text has been copied to your clipboard. Paste it into a <b>new</b> ChatGPT chat and then paste the contents of the generated code block below <i>(press "Copy code" in the top right on the code block)</i>:</p>
        <textarea value={response} onChange={(evt) => setResponse(evt.target.value)}></textarea>
        {response.length > 0 && <button onClick={parseStepOne}>Next step</button>}
      </div>}
    </div>}
    {step >= 10 && step < 15 && <div className="chat-gpt--step">
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
        <button onClick={copyStepTwo}>{step === 10 ? "Copy comments" : "Copy prompt again"}</button>
        <button onClick={() => setStep(20)}>Skip to next step</button>
      </div>
      {step > 10 && <div className="chat-gpt--step--response">
        <p>The comments have been copied to your clipboard. Paste them into the existing ChatGPT chat and then paste the contents of the generated code block below:</p>
        <textarea value={response} onChange={(evt) => setResponse(evt.target.value)}></textarea>
        {response.length > 0 && <button onClick={parseStepTwo}>Next step</button>}
      </div>}
    </div>}
    {step === 25 && <div className="chat-gpt--step">
      <h3>Step 2 & 3: Rank the cards</h3>
      <p>Ranking cards...</p>
    </div>}
    {step >= 20 && step < 25 && <div className="chat-gpt--step">
      <h3>Step 3: Rank the cards</h3>
      <p>This step doesn't have any settings, instead just press the button below.</p>
      <div className="chat-gpt--step--buttons">
        <button onClick={copyStepThree}>Copy prompt</button>
      </div>
      {step > 20 && <div className="chat-gpt--step--response">
        <p>The prompt has been copied to your clipboard. Paste it into the existing ChatGPT chat and then paste the contents of the generated code block below:</p>
        <textarea value={response} onChange={(evt) => setResponse(evt.target.value)}></textarea>
        {response.length > 0 && <button onClick={parseStepThree}>Next step</button>}
      </div>}
    </div>}
    {step === 35 && <div className="chat-gpt--step">
      <h3>Step 4 part 1/2: Create the cards</h3>
      <p>Generating cards...</p>
    </div>}
    {step >= 30 && step < 35 && <div className="chat-gpt--step">
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
    {step === 45 && <div className="chat-gpt--step">
      <h3>Step 4 part 2/2: Create the cards</h3>
      <p>Generating cards...</p>
    </div>}
    {step >= 40 && step < 45 && <div className="chat-gpt--step">
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
    {step === 55 && <div className="chat-gpt--step">
      <h3>Step 5: Add a bit of flavor</h3>
      <p>Writing flavor texts...</p>
    </div>}
    {step >= 50 && step < 55 && <div className="chat-gpt--step">
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
        <button onClick={copyStepSix}>{step === 50 ? "Copy flavor" : "Copy prompt again"}</button>
      </div>
      {step > 50 && <div className="chat-gpt--step--response">
        <p>The flavor has been copied to your clipboard. Paste it into the existing ChatGPT chat and then paste the contents of the generated code block below:</p>
        <textarea value={response} onChange={(evt) => setResponse(evt.target.value)}></textarea>
        {response.length > 0 && <button onClick={parseStepSix}>Next step</button>}
      </div>}
    </div>}
    {step === 65 && <div className="chat-gpt--step">
      <h3>Step 6: Prompts for your prompts</h3>
      <p>Generating image prompts...</p>
    </div>}
    {step >= 60 && step < 65 && <div className="chat-gpt--step">
      <h3>Step 6: Prompts for your prompts</h3>
      <p>This step still doesn't have any settings, instead just press the button below.</p>
      <InputCheckboxC
        label="Snow-covered basics?"
        desc="Do you want to replace all basic lands with their snow-covered counter parts?"
        name="snow-covered"
        value={settings.snowCovered}
        updateValue={(value: boolean) => setSettings({ ...settings, snowCovered: value })}
      />
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
        <button onClick={copyImagePrompt}>Copy Prompt</button>
        <button onClick={copyImagePath}>Copy Image Path</button>
        {cardIndex < aiCards.length - 1 && <button onClick={() => setCardIndex(cardIndex + 1)}>Next card</button>}
        {cardIndex === aiCards.length - 1 && <button onClick={finalize}>Finalize</button>}
      </div>
      <p>{aiCards[cardIndex].prompt}</p>
      <div className="chat-gpt--step--item">
        <CardC card={aiToCard(aiCards[cardIndex], 0)} set={set} usingRef={updateDimensions} />
      </div>
    </div>}
  </div>;
}
