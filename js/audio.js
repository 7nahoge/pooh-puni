/* 
  BGM、効果音
*/

let audioCtx = null;
let lastDogSoundAt = 0;
let lastFallSoundAt = 0;
let bgmGain = null;
let bgmTimerId = null;
let bgmPlaying = false;

const BGM_BPM = 156;
const BGM_BEAT = 60 / BGM_BPM;
const BGM_SECTION_BEATS = 32;
const BGM_SECTION_LENGTH = BGM_BEAT * BGM_SECTION_BEATS;
const BGM_LOOKAHEAD = 0.08;
const NOTE_STEPS = {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11};

const BGM_MELODY = [
  [0,"C5",.5],[.5,"E5",.5],[1,"G5",.5],[1.5,"A5",.5],[2,"G5",.75],[2.75,"E5",.25],[3,"D5",.75],[3.75,"E5",.25],
  [4,"F5",.5],[4.5,"A5",.5],[5,"C6",.5],[5.5,"B5",.5],[6,"A5",.75],[6.75,"G5",.25],[7,"E5",1],
  [8,"G5",.5],[8.5,"A5",.5],[9,"G5",.5],[9.5,"E5",.5],[10,"D5",.5],[10.5,"C5",.5],[11,"D5",.75],[11.75,"E5",.25],
  [12,"F5",.5],[12.5,"E5",.5],[13,"D5",.5],[13.5,"C5",.5],[14,"E5",.75],[14.75,"G5",.25],[15,"C5",1],
  [16,"E5",.5],[16.5,"G5",.5],[17,"A5",.5],[17.5,"C6",.5],[18,"B5",.5],[18.5,"A5",.5],[19,"G5",.75],[19.75,"E5",.25],
  [20,"F5",.5],[20.5,"A5",.5],[21,"G5",.5],[21.5,"E5",.5],[22,"D5",.5],[22.5,"C5",.5],[23,"D5",1],
  [24,"C5",.5],[24.5,"E5",.5],[25,"G5",.5],[25.5,"B5",.5],[26,"C6",.5],[26.5,"B5",.5],[27,"A5",.75],[27.75,"G5",.25],
  [28,"E5",.5],[28.5,"F5",.5],[29,"G5",.5],[29.5,"E5",.5],[30,"D5",.5],[30.5,"C5",.5],[31,"C5",1]
];

const BGM_BASS = [
  [0,"C3",2],[2,"G3",2],[4,"F3",2],[6,"G3",2],[8,"E3",2],[10,"A3",2],[12,"F3",2],[14,"G3",2],
  [16,"C3",2],[18,"G3",2],[20,"F3",2],[22,"G3",2],[24,"C3",2],[26,"E3",2],[28,"F3",2],[30,"G3",2]
];

const BGM_HARMONY = [[0,"E4",4],[4,"F4",4],[8,"E4",4],[12,"F4",4],[16,"E4",4],[20,"F4",4],[24,"E4",4],[28,"G4",4]];
const BGM_ARPEGGIO = Array.from({length: BGM_SECTION_BEATS}, (_, i) => [i + .5, ["G5","C6","E5","A5"][i % 4], .2]);

function noteFreq(name){
  const [, tone, octave] = name.match(/^([A-G])(\d)$/);
  const midi = (Number(octave) + 1) * 12 + NOTE_STEPS[tone];
  return 440 * Math.pow(2, (midi - 69) / 12);
}

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

function playTone({freq, startAt, length, type = "triangle", volume = .18, attack = .02, release = .05, filterFreq = null, filterEnd = null, bend = 1, destination = audioCtx.destination}){
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const endAt = startAt + length;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startAt);
  if(bend !== 1) osc.frequency.exponentialRampToValueAtTime(freq * bend, endAt);

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + attack);
  gain.gain.setValueAtTime(volume, Math.max(startAt + attack, endAt - release));
  gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

  if(filterFreq){
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(filterFreq, startAt);
    if(filterEnd) filter.frequency.exponentialRampToValueAtTime(filterEnd, endAt);
    osc.connect(filter);
    filter.connect(gain);
  }else{
    osc.connect(gain);
  }

  gain.connect(destination);

  osc.start(startAt);
  osc.stop(endAt + 0.03);
}

function playBgmTone(options){
  if(audioCtx && bgmGain) playTone({...options, destination: bgmGain});
}

function scheduleBgmPart(startAt, notes, options){
  notes.forEach(([time, pitch, length]) => {
    playBgmTone({
      ...options,
      freq: typeof pitch === "number" ? pitch : noteFreq(pitch),
      startAt: startAt + time * BGM_BEAT,
      length: length * BGM_BEAT
    });
  });
}

function scheduleRetroBgm(startAt){
  scheduleBgmPart(startAt, BGM_MELODY, {type:"square", volume:.14, filterFreq:2400, attack:.01, release:.08});
  scheduleBgmPart(startAt, BGM_BASS, {type:"triangle", volume:.08, filterFreq:1000, attack:.02, release:.12});
  scheduleBgmPart(startAt, BGM_HARMONY, {type:"triangle", volume:.05, filterFreq:1800, attack:.03, release:.12});
  scheduleBgmPart(startAt, BGM_ARPEGGIO, {type:"square", volume:.035, filterFreq:3200, attack:.005, release:.02});
}

function startBgm(){
  if(!audioCtx || bgmPlaying) return;
  bgmPlaying = true;

  bgmGain = audioCtx.createGain();
  bgmGain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;
  bgmGain.gain.cancelScheduledValues(now);
  bgmGain.gain.setValueAtTime(0.0001, now);
  bgmGain.gain.linearRampToValueAtTime(0.04, now + 0.4);

  let nextSectionAt = now + BGM_LOOKAHEAD;

  function scheduleNextSection(){
    if(!bgmPlaying) return;

    scheduleRetroBgm(nextSectionAt);
    nextSectionAt += BGM_SECTION_LENGTH;

    const delay = Math.max(0, (nextSectionAt - audioCtx.currentTime - BGM_LOOKAHEAD) * 1000);
    bgmTimerId = window.setTimeout(scheduleNextSection, delay);
  }

  scheduleNextSection();
}

function stopBgm(){
  if(!audioCtx || !bgmPlaying) return;
  bgmPlaying = false;

  if(bgmTimerId !== null){
    window.clearTimeout(bgmTimerId);
    bgmTimerId = null;
  }

  const fadingGain = bgmGain;
  bgmGain = null;

  if(fadingGain){
    const now = audioCtx.currentTime;
    fadingGain.gain.cancelScheduledValues(now);
    fadingGain.gain.setValueAtTime(fadingGain.gain.value || 0.04, now);
    fadingGain.gain.linearRampToValueAtTime(0.0001, now + 0.3);
    window.setTimeout(() => {
      fadingGain.disconnect();
    }, 350);
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

  playTone({
    freq: 620 + Math.random() * 35,
    startAt: now,
    length: .14,
    type: "triangle",
    volume: .09,
    attack: .012,
    filterFreq: 1800,
    filterEnd: 950,
    bend: .9
  });
}

function playDogPartySound(chainCount, clearedCount){
  const barks = Math.min(12, 5 + chainCount * 2 + Math.floor(clearedCount / 3));
  const pattern = [[0,1,1.08],[.08,.96,1.24],[.16,.98,1.38],[.24,.94,1.55],[.32,.96,1.18],[.4,.92,1.48],[.48,.94,1.64],[.56,1,1.3],[.64,.94,1.72],[.72,.9,1.42],[.8,.96,1.58],[.88,1,1.2]];

  for(let i=0;i<barks;i++){
    const [delay, strength, pitch] = pattern[i];
    playCuteDogSound(strength, delay, pitch, true);
  }
}

function playGameOverMusic(){
  if(!audioCtx) return;

  const now = audioCtx.currentTime;
  [[0,660,.18],[.18,560,.18],[.36,470,.24],[.62,350,.36],[1.02,260,.55]].forEach(([time, freq, length]) => {
    playTone({freq, startAt:now + time, length, type:"triangle", volume:.2, attack:.03, filterFreq:1400, filterEnd:650, bend:.88});
  });
  playTone({freq:130, startAt:now + .58, length:1.07, type:"sine", volume:.16, attack:.1, bend:82 / 130});
}

function playVictoryGameOverMusic(){
  if(!audioCtx) return;

  const now = audioCtx.currentTime;
  [[0,"C5",.16],[.15,"E5",.16],[.3,"G5",.18],[.47,"C6",.24],[.72,"B5",.16],[.87,"D6",.18],[1.04,"E6",.42]].forEach(([time, pitch, length], index) => {
    playTone({freq:noteFreq(pitch), startAt:now + time, length, type:index % 2 ? "square" : "triangle", volume:.18, attack:.015, filterFreq:3200, filterEnd:1900, bend:1.04});
  });

  ["C5","E5","G5","C6"].forEach((pitch, index)=>{
    playTone({freq:noteFreq(pitch), startAt:now + 1.42 + index * .025, length:.8, type:"triangle", volume:.11, attack:.04});
  });

  playCuteDogSound(0.85, 0.18, 1.6, true);
  playCuteDogSound(0.8, 0.38, 1.8, true);
  playCuteDogSound(0.9, 0.62, 1.7, true);
  playCuteDogSound(0.85, 1.0, 1.9, true);
}
