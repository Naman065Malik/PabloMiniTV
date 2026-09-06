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
    <div className="app">
      <Header />

      <main>
        <Hero />

        <Featured />

        <Content />

        <Learning />

        <Bedtime />

        <Safety />

        <TrustStrip />
      </main>

      <Footer />
    </div>
  );
}

export default App;
