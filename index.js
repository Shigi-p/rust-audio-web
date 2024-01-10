window.addEventListener("load", async function () {
  // 各種ブラウザ対応
  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  // Web Audio APIを使うためのおまじない
  let audioCtx = new AudioContext();

  // 出力先を変数化
  let destinationNode = audioCtx.destination;

  // AudioProcessorをモジュールとしてインポート
  await audioCtx.audioWorklet.addModule("./processor/audio.js");

  // wasmをArrayBufferとしてインポート
  const wasm = await fetch("./pkg/audio_logic_bg.wasm")
    .then((response) => response.arrayBuffer())
    .then((bytes) => {
      return bytes;
    });

  let audioNode = null;

  let playBtn = document.getElementById("playBtn");
  playBtn.addEventListener("click", async () => {
    // 再生する時のおまじない
    await audioCtx.resume();

    // audioNodeを作成
    audioNode = new AudioWorkletNode(audioCtx, "Audio");
    // gainパラメータを設定
    audioNode.parameters.get("gain").value =
      document.getElementById("gain").value / 100;
    audioNode.parameters.get("pwmWidth").value =
      document.getElementById("pwmWidth").value / 100;
    // audioProcessorにwasmのArrayBufferを送信
    audioNode.port.postMessage({ type: "wasm", wasm: wasm });
    audioNode.port.postMessage({
      type: "oscillatorType",
      oscillatorType: document.getElementById("oscillatorType").value,
    });
    audioNode.port.onmessage = (event) => {
      if (event.data.isInstancedWasm) {
        // audioNodeを出力先に接続
        audioNode.connect(destinationNode);
        audioNode.port.postMessage({ type: "isPlayed", isPlayed: true });
      }
    };
  });

  let stopBtn = document.getElementById("stopBtn");
  stopBtn.addEventListener("click", () => {
    audioNode.port.postMessage({ type: "isPlayed", isPlayed: false });
    audioNode.disconnect(destinationNode);
    audioNode = null;
  });

  let oscillator = document.getElementById("oscillatorType");
  oscillator.addEventListener("change", (e) => {
    audioNode.port.postMessage({
      type: "oscillatorType",
      oscillatorType: e.target.value,
    });
  });

  let pwmWidth = document.getElementById("pwmWidth");
  pwmWidth.addEventListener("input", (e) => {
    audioNode.parameters.get("pwmWidth").value = e.target.value / 100;
  });

  let gain = document.getElementById("gain");
  gain.addEventListener("input", (e) => {
    audioNode.parameters.get("gain").value = e.target.value / 100;
  });
});
