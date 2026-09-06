import "./App.css";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

import Hero from "./components/sections/Hero";
import Featured from "./components/sections/Featured";
import Learning from "./components/sections/LearningSection";
import Bedtime from "./components/sections/Bedtime";
import Content from "./components/sections/ContentRows";
import Safety from "./components/sections/Safety";
import TrustStrip from "./components/sections/TrustStrip";

function App() {
  return (
    <div className="app min-h-[100svh] flex flex-col bg-[#F8FAFE]">
      <Header />

      <main className="flex-1 w-full px-6 md:px-10 lg:px-16 xl:px-20">
        <div className="max-w-[1400px] mx-auto">
          <Hero />
          <Featured />
          <Content />
          <Learning />
          <Bedtime />
          <Safety />
          <TrustStrip />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
