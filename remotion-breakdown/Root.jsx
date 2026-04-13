import { Composition, registerRoot } from 'remotion';
import { DriftwoodBreakdown } from './Breakdown.jsx';

export const RemotionRoot = () => (
  <Composition
    id="DriftwoodBreakdown"
    component={DriftwoodBreakdown}
    durationInFrames={896}
    fps={30}
    width={1920}
    height={1080}
  />
);

registerRoot(RemotionRoot);
