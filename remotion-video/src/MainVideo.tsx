import { AbsoluteFill, Series } from "remotion";
import { Scene1Title } from "./scenes/Scene1Title";
import { Scene2Problem } from "./scenes/Scene2Problem";
import { Scene3FourZero } from "./scenes/Scene3FourZero";
import { Scene4Platform } from "./scenes/Scene4Platform";
import { Scene5Trajectory } from "./scenes/Scene5Trajectory";
import { Scene6Closing } from "./scenes/Scene6Closing";

export const MainVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#06101F" }}>
    <Series>
      <Series.Sequence durationInFrames={150}><Scene1Title /></Series.Sequence>
      <Series.Sequence durationInFrames={150}><Scene2Problem /></Series.Sequence>
      <Series.Sequence durationInFrames={180}><Scene3FourZero /></Series.Sequence>
      <Series.Sequence durationInFrames={150}><Scene4Platform /></Series.Sequence>
      <Series.Sequence durationInFrames={150}><Scene5Trajectory /></Series.Sequence>
      <Series.Sequence durationInFrames={120}><Scene6Closing /></Series.Sequence>
    </Series>
  </AbsoluteFill>
);
