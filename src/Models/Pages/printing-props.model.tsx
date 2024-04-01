import { PrintDataM } from "../print-data.model";
import { SetM } from "../set.model";

export interface PrintingPropsM {
  printData: Array<PrintDataM>;
  sets: Array<SetM>;
}
