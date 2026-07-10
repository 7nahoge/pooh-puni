let audioCtx = null;
let lastDogSoundAt = 0;
let lastFallSoundAt = 0;

function initAudio(){
  if(!audioCtx){
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if(!AudioContextClass) return;
    audioCtx = new AudioContextClass();
  }

  if(audioCtx.state === "suspended"){
    audioCtx.resume();
  }
}

function playCuteDogSound(strength=1, delay=0, pitch=1, force=false){
  if(!audioCtx) return;

  const now = audioCtx.currentTime;
  const startAt = now + delay;

  if(!force && now - lastDogSoundAt < 0.06) return;
  lastDogSoundAt = startAt;

  const voice = audioCtx.createOscillator();
  const chirp = audioCtx.createOscillator();
  const voiceGain = audioCtx.createGain();
  const chirpGain = audioCtx.createGain();
  const masterGain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  voice.type = "triangle";
  voice.frequency.setValueAtTime((680 + Math.random() * 50) * pitch, startAt);
  voice.frequency.exponentialRampToValueAtTime((980 + Math.random() * 70) * pitch, startAt + 0.025);
  voice.frequency.exponentialRampToValueAtTime((520 + Math.random() * 40) * pitch, startAt + 0.12);

  chirp.type = "square";
  chirp.frequency.setValueAtTime((1200 + Math.random() * 90) * pitch, startAt + 0.035);
  chirp.frequency.exponentialRampToValueAtTime((760 + Math.random() * 60) * pitch, startAt + 0.15);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2400 * Math.max(0.8, pitch), startAt);
  filter.frequency.exponentialRampToValueAtTime(1150 * Math.max(0.8, pitch), startAt + 0.2);

  voiceGain.gain.setValueAtTime(0.0001, startAt);
  voiceGain.gain.exponentialRampToValueAtTime(0.42 * strength, startAt + 0.012);
  voiceGain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.18);

  chirpGain.gain.setValueAtTime(0.0001, startAt + 0.025);
  chirpGain.gain.exponentialRampToValueAtTime(0.28 * strength, startAt + 0.055);
  chirpGain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.19);

  masterGain.gain.setValueAtTime(0.85, startAt);

  voice.connect(voiceGain);
  chirp.connect(chirpGain);
  voiceGain.connect(filter);
  chirpGain.connect(filter);
  filter.connect(masterGain);
  masterGain.connect(audioCtx.destination);

  voice.start(startAt);
  voice.stop(startAt + 0.22);
  chirp.start(startAt + 0.025);
  chirp.stop(startAt + 0.22);
}

function playFallSound(){
  if(!audioCtx) return;

  const now = audioCtx.currentTime;

  if(now - lastFallSoundAt < 0.08) return;
  lastFallSoundAt = now;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(620 + Math.random() * 35, now);
  osc.frequency.exponentialRampToValueAtTime(780 + Math.random() * 45, now + 0.025);
  osc.frequency.exponentialRampToValueAtTime(560 + Math.random() * 30, now + 0.12);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1800, now);
  filter.frequency.exponentialRampToValueAtTime(950, now + 0.13);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.09, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.15);
}

function playDogPartySound(chainCount, clearedCount){
  const barks = Math.min(12, 5 + chainCount * 2 + Math.floor(clearedCount / 3));
  const pattern = [
    {delay:0, strength:0.9, pitch:1.08},
    {delay:0.08, strength:0.84, pitch:1.24},
    {delay:0.16, strength:0.88, pitch:1.38},
    {delay:0.24, strength:0.78, pitch:1.55},
    {delay:0.32, strength:0.86, pitch:1.18},
    {delay:0.4, strength:0.82, pitch:1.48},
    {delay:0.48, strength:0.78, pitch:1.64},
    {delay:0.56, strength:0.9, pitch:1.3},
    {delay:0.64, strength:0.82, pitch:1.72},
    {delay:0.72, strength:0.76, pitch:1.42},
    {delay:0.8, strength:0.86, pitch:1.58},
    {delay:0.88, strength:0.9, pitch:1.2}
  ];

  for(let i=0;i<barks;i++){
    const bark = pattern[i];
    playCuteDogSound(bark.strength, bark.delay, bark.pitch, true);
  }
}

function playGameOverMusic(){
  if(!audioCtx) return;

  const now = audioCtx.currentTime;
  const melody = [
    {time:0, freq:660, length:0.18},
    {time:0.18, freq:560, length:0.18},
    {time:0.36, freq:470, length:0.24},
    {time:0.62, freq:350, length:0.36},
    {time:1.02, freq:260, length:0.55}
  ];

  melody.forEach(note=>{
    const startAt = now + note.time;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(note.freq, startAt);
    osc.frequency.exponentialRampToValueAtTime(note.freq * 0.88, startAt + note.length);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1400, startAt);
    filter.frequency.exponentialRampToValueAtTime(650, startAt + note.length);

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.2, startAt + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + note.length);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(startAt);
    osc.stop(startAt + note.length + 0.03);
  });

  const bass = audioCtx.createOscillator();
  const bassGain = audioCtx.createGain();

  bass.type = "sine";
  bass.frequency.setValueAtTime(130, now + 0.58);
  bass.frequency.exponentialRampToValueAtTime(82, now + 1.55);

  bassGain.gain.setValueAtTime(0.0001, now + 0.58);
  bassGain.gain.exponentialRampToValueAtTime(0.16, now + 0.68);
  bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.65);

  bass.connect(bassGain);
  bassGain.connect(audioCtx.destination);

  bass.start(now + 0.58);
  bass.stop(now + 1.7);
}

function playVictoryGameOverMusic(){
  if(!audioCtx) return;

  const now = audioCtx.currentTime;
  const melody = [
    {time:0, freq:523.25, length:0.16},
    {time:0.15, freq:659.25, length:0.16},
    {time:0.3, freq:783.99, length:0.18},
    {time:0.47, freq:1046.5, length:0.24},
    {time:0.72, freq:987.77, length:0.16},
    {time:0.87, freq:1174.66, length:0.18},
    {time:1.04, freq:1318.51, length:0.42}
  ];

  melody.forEach((note, index)=>{
    const startAt = now + note.time;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = index % 2 === 0 ? "triangle" : "square";
    osc.frequency.setValueAtTime(note.freq, startAt);
    osc.frequency.exponentialRampToValueAtTime(note.freq * 1.04, startAt + note.length);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(3200, startAt);
    filter.frequency.exponentialRampToValueAtTime(1900, startAt + note.length);

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.18, startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + note.length);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(startAt);
    osc.stop(startAt + note.length + 0.03);
  });

  const chordNotes = [523.25, 659.25, 783.99, 1046.5];

  chordNotes.forEach((freq, index)=>{
    const startAt = now + 1.42 + index * 0.025;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, startAt);

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.11, startAt + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.8);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(startAt);
    osc.stop(startAt + 0.85);
  });

  playCuteDogSound(0.85, 0.18, 1.6, true);
  playCuteDogSound(0.8, 0.38, 1.8, true);
  playCuteDogSound(0.9, 0.62, 1.7, true);
  playCuteDogSound(0.85, 1.0, 1.9, true);
}
