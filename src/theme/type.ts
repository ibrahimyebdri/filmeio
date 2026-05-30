import { TextStyle } from "react-native";

export const type = {
  largeTitle: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "700"
  } satisfies TextStyle,
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700"
  } satisfies TextStyle,
  headline: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600"
  } satisfies TextStyle,
  body: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "400"
  } satisfies TextStyle,
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500"
  } satisfies TextStyle
};
