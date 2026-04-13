import { Composition, registerRoot } from 'remotion';
import { Journal07Breakdown } from './Journal07.jsx';

export const RemotionRoot = () => (
  <Composition
    id="Journal07"
    component={Journal07Breakdown}
    durationInFrames={896}
    fps={30}
    width={1920}
    height={1080}
  />
);

registerRoot(RemotionRoot);
