import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CoreAdvantages from './components/CoreAdvantages';
import UseCases from './components/UseCases';
import CTA from './components/CTA';
import Footer from './components/Footer';

function App() {
  return (
    <div className="font-poppins bg-[#080812] min-h-screen">
      <Navbar />
      <Hero />
      <CoreAdvantages />
      <UseCases />
      <CTA />
      <Footer />
    </div>
  );
}

export default App;
