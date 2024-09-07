'use client'
import React, {useState} from 'react';
import Game from './components/game';

function App() {
  const [audioSrc, setAudioSrc] = useState<string | undefined>(undefined);
  console.log(audioSrc)
  return (
      <div className="App">
           <Game setAudioSrc={setAudioSrc}/>
      </div>
  );
}

export default App;
