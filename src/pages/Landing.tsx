import { HeroSection } from '../components/sections/HeroSection';
import { AboutSection } from '../components/sections/AboutSection';
import { DFOArchitecture } from '../components/sections/DFOArchitecture';
import { RoleBasedSystem } from '../components/sections/RoleBasedSystem';
import { CoreFeatures } from '../components/sections/CoreFeatures';
import { CTASection } from '../components/sections/CTASection';

export function Landing() {
  return (
    <div className="overflow-x-hidden w-full bg-white selection:bg-sky-100 selection:text-sky-900">
      <HeroSection />
      
      <div id="about" className="relative">
        <AboutSection />
      </div>
      
      <DFOArchitecture />
      
      <div id="roles" className="relative">
        <RoleBasedSystem />
      </div>
      
      <div id="features" className="relative">
        <CoreFeatures />
      </div>
      
      <CTASection />
    </div>
  );
}
