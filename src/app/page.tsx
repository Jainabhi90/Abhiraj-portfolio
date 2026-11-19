import { Hero, WhoAmI, Experience, OnlinePresence, Contact, Marquee } from "@/components/Sections";
import { WorkList, TechStack } from "@/components/CorrectedSections";
import { WhatIDo, Orbit, Journey, SectionCurve } from "@/components/Motion";
export default function Home() {
  return (
    <>
      <Hero />
      <WhoAmI />
      <Experience />
      <SectionCurve from="ivory" to="forest-2" />
      <WhatIDo />
      <Orbit />
      <SectionCurve from="forest-2" to="ivory" />
      <WorkList />
      <SectionCurve from="ivory" to="forest" />
      <TechStack />
      <SectionCurve from="forest" to="cream" />
      <Journey />
      <OnlinePresence />
      <Marquee />
      <SectionCurve from="cream" to="forest" />
      <Contact />
    </>
  );
}
