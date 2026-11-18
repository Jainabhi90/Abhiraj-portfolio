import { Hero, WhoAmI, Experience, Contact } from "@/components/Sections";
import { WorkList, TechStack } from "@/components/CorrectedSections";
import { WhatIDo, Orbit, Journey } from "@/components/Motion";
export default function Home() {
  return (
    <>
      <Hero />
      <WhoAmI />
      <WhatIDo />
      <Orbit />
      <WorkList />
      <TechStack />
      <Journey />
      <Experience />
      <Contact />
    </>
  );
}
