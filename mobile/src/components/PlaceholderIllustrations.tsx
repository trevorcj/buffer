import AgbaArt from '../../assets/agbaIllustration.svg';
import InsightsArt from '../../assets/insights-illustration.svg';
import TipArt from '../../assets/tip-illustration.svg';
import YakubuArt from '../../assets/yakubuIllustration.svg';

type IllustrationProps = {
  height: number;
  width: number;
};

export function AgbaIllustration(props: IllustrationProps) {
  return <AgbaArt {...props} />;
}

export function YakubuIllustration(props: IllustrationProps) {
  return <YakubuArt {...props} />;
}

export function TipIllustration(props: IllustrationProps) {
  return <TipArt {...props} />;
}

export function InsightsIllustration(props: IllustrationProps) {
  return <InsightsArt {...props} />;
}
