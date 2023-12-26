class OscillatorProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    // phaseプロパティを定義
    this.phase = 0;

    // sineプロパティを定義
    this.sine = null;
    // sawtoothプロパティを定義
    this.sawtooth = null;

    // oscillatorNodeから受信したメッセージの処理
    this.port.onmessage = (event) => {
      // wasmをコンパイルしてインスタンス化
      WebAssembly.instantiate(event.data).then((result) => {
        // sineプロパティにwasmの関数を代入
        this.sine = result.instance.exports.sine;
        this.sawtooth = result.instance.exports.sawtooth;
        // oscillatorNodeのsineプロパティにwasmの関数を代入したことを送信
        this.port.postMessage({ inputWasm: true });
      });
    };
  }

  /**
   * outputs: unknown[][][]; 出力の数 x Channel数 x 128(Audio Workletが一度に処理できる数)
   */
  //オーディオ処理の実装箇所
  process(inputs, outputs, parameters) {
    if (!this.sine) return false;

    // 複数の入出力があった場合、最初のinputs, outputsを取得
    // let input = inputs[0];
    let output = outputs[0];

    for (let channel = 0; channel < output.length; channel++) {
      for (let i = 0; i < output[channel].length; i++) {
        // 正弦波の生成
        // output[channel][i] = Math.sin((2.0 * Math.PI * 440 * this.phase) / sampleRate);
        output[channel][i] = this.sine(this.phase, sampleRate);

        // ノコギリ波の生成
        // output[channel][i] = (2 * this.phase) / (sampleRate / 440) - 1;
        // output[channel][i] = this.sawtooth(this.phase, sampleRate);

        this.phase++;

        if (sampleRate / 440 <= this.phase) {
          this.phase = 0;
        }
      }
    }

    return true;
  }
}
//"Oscillator"にOscillatorクラスを登録
registerProcessor("Oscillator", OscillatorProcessor);
