import { IllustrationAsset } from "./IllustrationAsset";

type IllustrationProps = {
  height: number;
  width: number;
};

export function AgbaIllustration(props: IllustrationProps) {
  return (
    <IllustrationAsset
      source={require("../../assets/agbaIllustration.svg")}
      {...props}
    />
  );
}

export function YakubuIllustration(props: IllustrationProps) {
  return (
    <IllustrationAsset
      source={require("../../assets/yakubuIllustration.svg")}
      {...props}
    />
  );
}

export function TipIllustration(props: IllustrationProps) {
  return (
    <IllustrationAsset
      source={require("../../assets/tip-illustration.svg")}
      {...props}
    />
  );
}

export function InsightsIllustration(props: IllustrationProps) {
  return (
    <IllustrationAsset
      source={require("../../assets/insights-illustration.svg")}
      {...props}
    />
  );
}
