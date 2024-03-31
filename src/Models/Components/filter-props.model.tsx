import { FiltersM } from "../filters.model";
import { SetM } from "../set.model";

export interface FilterPropsM {
  filters: FiltersM;
  sets: Array<SetM>;
  updateFilters: (newFilters: FiltersM) => void;
}
