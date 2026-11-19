import { Hero, WhoAmI, Experience, OnlinePresence, Contact } from "@/components/Sections";
import { WorkList, TechStack } from "@/components/CorrectedSections";
import { WhatIDo, Orbit, Journey } from "@/components/Motion";
export default function Home() {
  return (
    <>
      <Hero />
      <WhoAmI />
      <Experience />
      <WhatIDo />
      <Orbit />
      <WorkList />
      <TechStack />
      <Journey />
      <OnlinePresence />
      <Contact />
    </>
  );
}
