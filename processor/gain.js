class GainProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.isStopped = false;

    // oscillatorNodeから受信したメッセージの処理
    this.port.onmessage = (event) => {
      if (event.data.isStopped) {
        this.isStopped = event.data.isStopped;
      }
    };
  }

  /**
   * type gainType[]
   */
  static get parameterDescriptors() {
    return [
      {
        name: "gain",
        defaultValue: 1,
        minValue: 0,
        maxValue: 1,
        automationRate: "a-rate", // a-rate or k-rate
      },
    ];
  }

  /**
   * inputs: unknown[][][]; 入力の数 x Channel数 x 128(Audio Workletが一度に処理できる数)
   * outputs: unknown[][][]; 出力の数 x Channel数 x 128(Audio Workletが一度に処理できる数)
   */
  //オーディオ処理の実装箇所
  process(inputs, outputs, parameters) {
    if (this.isStopped) return false;

    // 複数の入出力があった場合、最初のinputs, outputsを取得
    let input = inputs[0];
    let output = outputs[0];

    for (let channel = 0; channel < output.length; channel++) {
      for (let i = 0; i < output[channel].length; i++) {
        output[channel][i] = parameters.gain[0] * input[channel][i];
      }
    }

    return true;
  }
}
//"Oscillator"にOscillatorクラスを登録
registerProcessor("Gain", GainProcessor);
