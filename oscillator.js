class OscillatorProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.phase = 0;

    this.sine = null;
    this.sawtooth = null;
    this.square = null;
    this.triangle = null;
    this.noise = null;

    this.isStopped = false;

    // oscillatorNodeから受信したメッセージの処理
    this.port.onmessage = (event) => {
      // wasmをコンパイルしてインスタンス化
      if (event.data.wasm) {
        // FIXME: instantiateの第二引数に正しいオブジェクトを渡す？もしくは根本の構成を変更する？
        WebAssembly.instantiate(event.data.wasm, { wbg: "foobar" }).then(
          (result) => {
            this.sine = result.instance.exports.sine;
            this.sawtooth = result.instance.exports.sawtooth;
            this.square = result.instance.exports.square;
            this.triangle = result.instance.exports.triangle;
            this.noise = result.instance.exports.noise;

            // oscillatorNodeにwasmの関数が代入されたことを送信
            this.port.postMessage({ inputWasm: true });
          }
        );
      }

      if (event.data.isStopped) {
        this.isStopped = event.data.isStopped;
      }
    };
  }

  /**
   * outputs: unknown[][][]; 出力の数 x Channel数 x 128(Audio Workletが一度に処理できる数)
   */
  //オーディオ処理の実装箇所
  process(_inputs, outputs, _parameters) {
    if (
      !this.sine ||
      !this.sawtooth ||
      !this.square ||
      !this.triangle ||
      !this.noise ||
      this.isStopped
    )
      return false;

    // 複数の出力があった場合、最初のoutputsを取得
    let output = outputs[0];

    for (let channel = 0; channel < output.length; channel++) {
      for (let i = 0; i < output[channel].length; i++) {
        // 正弦波の生成
        // output[channel][i] = this.sine(this.phase, sampleRate);

        // ノコギリ波の生成
        // output[channel][i] = this.sawtooth(this.phase, sampleRate);

        // 矩形波の生成
        // output[channel][i] = this.square(this.phase, sampleRate);

        // 三角波の生成
        // output[channel][i] = this.triangle(this.phase, sampleRate);

        // ホワイトノイズの生成
        output[channel][i] = this.noise();

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
