'use client'
import React, {useState} from 'react';
import Game from './components/game';
import { Spectrum } from './components/spectrum/spectrum';

function App() {
  const [audioSrc, setAudioSrc] = useState<string | undefined>(undefined);
  console.log(audioSrc)
  return (
      <div className="App">
        <div className='z-0 absolute'>
          <Spectrum audioUrl={audioSrc}/>
        </div>
        <Game setAudioSrc={setAudioSrc} audioSrc={audioSrc}/>
      </div>
  );
}

export default App;
 