// Som e vibração a cada leitura, para ela não precisar olhar a tela para saber o resultado.
// O áudio só pode começar depois de um toque (regra dos navegadores, principalmente no
// iPhone), por isso destravarSom() é chamado no "Abrir câmera". A vibração não existe
// no iPhone pelo navegador; lá fica só o som.

export type Sinal = "ok" | "barrado" | "atencao" | "falha";

let audio: AudioContext | null = null;

export function destravarSom() {
  if (typeof window === "undefined") return;
  audio ??= new AudioContext();
  if (audio.state === "suspended") void audio.resume();
}

// [frequência em Hz, duração em ms] de cada bipe.
const BIPES: Record<Sinal, [number, number][]> = {
  ok: [[1046, 140]],
  barrado: [
    [220, 170],
    [220, 170],
  ],
  atencao: [
    [660, 130],
    [523, 180],
  ],
  falha: [[392, 260]],
};

const VIBRACOES: Record<Sinal, number[]> = {
  ok: [70],
  barrado: [90, 70, 90, 70, 90],
  atencao: [200],
  falha: [40, 60, 40],
};

export function sinalizar(sinal: Sinal) {
  navigator.vibrate?.(VIBRACOES[sinal]);
  if (!audio) return;
  let inicio = audio.currentTime;
  for (const [frequencia, ms] of BIPES[sinal]) {
    const osc = audio.createOscillator();
    const volume = audio.createGain();
    osc.type = "sine";
    osc.frequency.value = frequencia;
    // Ataque e queda curtos para o bipe não estalar.
    volume.gain.setValueAtTime(0.0001, inicio);
    volume.gain.exponentialRampToValueAtTime(0.25, inicio + 0.01);
    volume.gain.exponentialRampToValueAtTime(0.0001, inicio + ms / 1000);
    osc.connect(volume).connect(audio.destination);
    osc.start(inicio);
    osc.stop(inicio + ms / 1000 + 0.02);
    inicio += ms / 1000 + 0.06;
  }
}
