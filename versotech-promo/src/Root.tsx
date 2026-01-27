import { Composition } from "remotion";
import { VersoPromo } from "./VersoPromo";

export const RemotionRoot = () => {
  return (
    <Composition
      id="VersoPromo"
      component={VersoPromo}
      durationInFrames={1800} // 60 seconds at 30fps
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
