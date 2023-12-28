import "./style.scss";

window.addEventListener("load", async function () {
  // 各種ブラウザ対応
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  // Web Audio APIを使うためのおまじない
  let audioCtx = new AudioContext();

  // 出力先を変数化
  let destinationNode = audioCtx.destination;

  // OscillatorProcessorをモジュールとしてインポート
  await audioCtx.audioWorklet.addModule("./oscillator.js");
  await audioCtx.audioWorklet.addModule("./gain.js");

  // wasmをArrayBufferとしてインポート
  const wasm = await fetch("./pkg/audio_logic_bg.wasm")
    .then((response) => response.arrayBuffer())
    .then((bytes) => {
      return bytes;
    });

  let oscillatorNode = null;

  // gainNodeを作成
  let gainNode = null;

  let playBtn = document.getElementById("playBtn");
  playBtn.addEventListener("click", async () => {
    // 再生する時のおまじない
    await audioCtx.resume();

    // oscillatorNodeを作成
    oscillatorNode = new AudioWorkletNode(audioCtx, "Oscillator");
    gainNode = new AudioWorkletNode(audioCtx, "Gain");
    gainNode.parameters.get("gain").value =
      document.getElementById("gain").value / 100;

    // oscillatorProcessorにwasmのArrayBufferを送信
    oscillatorNode.port.postMessage({ wasm: wasm });

    // oscillatorProcessorから受信したメッセージの処理
    oscillatorNode.port.onmessage = (event) => {
      if (event.data.inputWasm) {
        // oscillatorNodeを出力先に接続
        // oscillatorNode.connect(destinationNode);
        oscillatorNode.connect(gainNode).connect(destinationNode);
      }
    };
  });

  let stopBtn = document.getElementById("stopBtn");
  stopBtn.addEventListener("click", () => {
    // oscillatorNodeを出力先から外す
    oscillatorNode.port.postMessage({ isStopped: true });
    oscillatorNode.disconnect();

    // gainNodeを出力先から外す
    gainNode.port.postMessage({ isStopped: true });
    gainNode.disconnect();
  });

  let gain = document.getElementById("gain");
  gain.addEventListener("input", (e) => {
    gainNode.parameters.get("gain").value = e.target.value / 100;
  });
});
