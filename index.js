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
    .then((bytes) => bytes);

  let audioNode = null;

  let keys = document.querySelectorAll(".key");
  keys.forEach((key) => {
    key.addEventListener("mousedown", async (e) => {
      // 再生する時のおまじない
      await audioCtx.resume();

      // audioNodeを作成
      audioNode = new AudioWorkletNode(audioCtx, "Audio");

      // audioProcessorにwasmのArrayBufferを送信
      audioNode.port.postMessage({ type: "wasm", wasm: wasm });

      audioNode.port.postMessage({
        type: "keyName",
        keyName: e.target.dataset.keyName,
      });
      audioNode.port.postMessage({
        type: "keyPitch",
        keyPitch: e.target.dataset.keyPitch,
      });

      // oscillator1
      audioNode.parameters.get("gain1").value =
        document.getElementById("gain1").value / 100;
      audioNode.parameters.get("pwmWidth1").value =
        document.getElementById("pwmWidth1").value / 100;
      audioNode.parameters.get("coarse1").value =
        document.getElementById("coarse1").value;
      audioNode.parameters.get("fine1").value =
        document.getElementById("fine1").value;
      audioNode.port.postMessage({
        type: "oscillatorType1",
        oscillatorType1: document.getElementById("oscillatorType1").value,
      });
      // oscillator2
      audioNode.parameters.get("gain2").value =
        document.getElementById("gain2").value / 100;
      audioNode.parameters.get("pwmWidth2").value =
        document.getElementById("pwmWidth2").value / 100;
      audioNode.parameters.get("coarse2").value =
        document.getElementById("coarse2").value;
      audioNode.parameters.get("fine2").value =
        document.getElementById("fine2").value;
      audioNode.port.postMessage({
        type: "oscillatorType2",
        oscillatorType2: document.getElementById("oscillatorType2").value,
      });
      // oscillator3
      audioNode.parameters.get("gain3").value =
        document.getElementById("gain3").value / 100;
      audioNode.parameters.get("pwmWidth3").value =
        document.getElementById("pwmWidth3").value / 100;
      audioNode.parameters.get("coarse3").value =
        document.getElementById("coarse3").value;
      audioNode.parameters.get("fine3").value =
        document.getElementById("fine3").value;
      audioNode.port.postMessage({
        type: "oscillatorType3",
        oscillatorType3: document.getElementById("oscillatorType3").value,
      });

      audioNode.port.onmessage = (event) => {
        if (event.data.isInstancedWasm) {
          // audioNodeを出力先に接続
          audioNode.connect(destinationNode);
          audioNode.port.postMessage({
            type: "isPlayed",
            isPlayed: true,
          });
        }
      };

      key.addEventListener("mouseup", () => {
        audioNode.port.postMessage({ type: "isPlayed", isPlayed: false });
        audioNode.disconnect(destinationNode);
        audioNode = null;
      });
    });
  });

  // oscillator1
  let oscillatorType1 = document.getElementById("oscillatorType1");
  oscillatorType1.addEventListener("change", (e) => {
    audioNode.port.postMessage({
      type: "oscillatorType1",
      oscillatorType1: e.target.value,
    });
  });
  let pwmWidth1 = document.getElementById("pwmWidth1");
  pwmWidth1.addEventListener("input", (e) => {
    audioNode.parameters.get("pwmWidth1").value = e.target.value / 100;
  });
  let coarse1 = document.getElementById("coarse1");
  coarse1.addEventListener("input", (e) => {
    audioNode.parameters.get("coarse1").value = e.target.value;
  });
  let fine1 = document.getElementById("fine1");
  fine1.addEventListener("input", (e) => {
    audioNode.parameters.get("fine1").value = e.target.value;
  });
  let gain1 = document.getElementById("gain1");
  gain1.addEventListener("input", (e) => {
    audioNode.parameters.get("gain1").value = e.target.value / 100;
  });
  // oscillator2
  let oscillatorType2 = document.getElementById("oscillatorType2");
  oscillatorType2.addEventListener("change", (e) => {
    audioNode.port.postMessage({
      type: "oscillatorType2",
      oscillatorType2: e.target.value,
    });
  });
  let pwmWidth2 = document.getElementById("pwmWidth2");
  pwmWidth2.addEventListener("input", (e) => {
    audioNode.parameters.get("pwmWidth2").value = e.target.value / 100;
  });
  let coarse2 = document.getElementById("coarse2");
  coarse2.addEventListener("input", (e) => {
    audioNode.parameters.get("coarse2").value = e.target.value;
  });
  let fine2 = document.getElementById("fine2");
  fine2.addEventListener("input", (e) => {
    audioNode.parameters.get("fine2").value = e.target.value;
  });
  let gain2 = document.getElementById("gain2");
  gain2.addEventListener("input", (e) => {
    audioNode.parameters.get("gain2").value = e.target.value / 100;
  });
  // oscillator3
  let oscillatorType3 = document.getElementById("oscillatorType3");
  oscillatorType3.addEventListener("change", (e) => {
    audioNode.port.postMessage({
      type: "oscillatorType3",
      oscillatorType3: e.target.value,
    });
  });
  let pwmWidth3 = document.getElementById("pwmWidth3");
  pwmWidth3.addEventListener("input", (e) => {
    audioNode.parameters.get("pwmWidth3").value = e.target.value / 100;
  });
  let coarse3 = document.getElementById("coarse3");
  coarse3.addEventListener("input", (e) => {
    audioNode.parameters.get("coarse3").value = e.target.value;
  });
  let fine3 = document.getElementById("fine3");
  fine3.addEventListener("input", (e) => {
    audioNode.parameters.get("fine3").value = e.target.value;
  });
  let gain3 = document.getElementById("gain3");
  gain3.addEventListener("input", (e) => {
    audioNode.parameters.get("gain3").value = e.target.value / 100;
  });

  let masterVolume = document.getElementById("masterVolume");
  masterVolume.addEventListener("input", (e) => {
    audioNode.parameters.get("masterVolume").value = e.target.value / 100;
  });
});
