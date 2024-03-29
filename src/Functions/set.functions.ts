import { SetM } from "../Models/set.model";
import { getNewId } from "./utils";

export function createNewSet(ids: Array<string>): SetM {
  return {
    id: getNewId(ids),
    name: "New set",
    icon: "Icon path"
  }
}
