import { Composition } from "remotion";
import { LobsHype } from "./LobsHype";

export const RemotionRoot = () => {
  return (
    <Composition
      id="LobsHype"
      component={LobsHype}
      durationInFrames={450}
      fps={30}
      width={1080}
      height={1080}
    />
  );
};
