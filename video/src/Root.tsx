import { Composition } from "remotion";
import { LobsHype } from "./LobsHype";
import { LobsPvP } from "./LobsPvP";
import { LobsLive } from "./LobsLive";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="LobsHype"
        component={LobsHype}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="LobsPvP"
        component={LobsPvP}
        durationInFrames={540}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="LobsLive"
        component={LobsLive}
        durationInFrames={390}
        fps={30}
        width={1080}
        height={1080}
      />
    </>
  );
};
