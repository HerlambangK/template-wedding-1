let globalAudio: HTMLAudioElement | null = null;
let globalSrc: string | null = null;

export function initAndPlayAudio(src: string) {
  if (globalAudio && globalSrc === src) {
    globalAudio.play().catch(() => {});
    return globalAudio;
  }

  if (globalAudio) {
    globalAudio.pause();
    globalAudio.src = "";
  }

  const audio = new Audio();
  audio.volume = 0.3;
  audio.loop = true;
  audio.preload = "auto";
  audio.src = src;

  audio.addEventListener("canplaythrough", () => {
    audio.play().catch(() => {});
  }, { once: true });

  audio.addEventListener("error", () => {
    globalAudio = null;
    globalSrc = null;
  });

  globalAudio = audio;
  globalSrc = src;

  audio.play().catch(() => {});

  return audio;
}

export function getAudio() {
  return globalAudio;
}

export function getAudioSrc() {
  return globalSrc;
}
