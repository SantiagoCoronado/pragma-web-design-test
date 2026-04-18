import { customAlphabet } from "nanoid";

export const quoteId = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyz",
  10
);
