class Noise extends AudioWorkletProcessor {
  constructor() {
    super();

    this.sine = null;

    // this.port.postMessage("pon");

    this.port.onmessage = (event) => {
      // console.log("processor", event.data);

      WebAssembly.compile(event.data).then((mod) => {
        WebAssembly.instantiate(mod).then((result) => {
          this.sine = result.exports.sine;
        });
      });
    };
  }

  //オーディオ処理の実装箇所
  process(inputs, outputs, parameters) {
    //複数の入出力があった場合、最初のinputs, outputsを取得
    // let input = inputs[0];
    let output = outputs[0];

    for (let channel = 0; channel < output.length; channel++) {
      for (let i = 0; i < output[channel].length; i++) {
        /*
        // jsで正弦波を出力する場合
        output[channel][i] =
          0.5 *
          Math.sin((440 * 2.0 * Math.PI * (currentFrame + i)) / sampleRate);
          */
        output[channel][i] = this.sine(currentFrame, sampleRate, i);
      }
    }
    return true;
  }
}
//"Noise"にNoiseクラスを登録
registerProcessor("Noise", Noise);
