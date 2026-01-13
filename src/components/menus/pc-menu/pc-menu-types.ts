import { PcMenuFields } from "@/types/types";

export type Props = {
    getFields: () => PcMenuFields;
    setFields: (newValue: PcMenuFields) => void;
    subscribeFields: (fn: (value: PcMenuFields) => void) => () => void;
}