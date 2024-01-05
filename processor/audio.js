import init, { main_fn, phase_fn } from "../pkg/audio_logic.js";

//"Audior"にAudioクラスを登録
registerProcessor(
  "Audio",
  class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
      super();

      this.mainFn = null;
      this.phaseFn = null;
      this.phase = 0;
      this.oscillatorType = "sine";
      this.isPlayed = false;

      // audioNodeから受信したメッセージの処理
      this.port.onmessage = async (event) => {
        // wasmをコンパイルしてインスタンス化
        if (event.data.type === "wasm") {
          // FIXME: instantiateの第二引数に正しいオブジェクトを渡す？もしくは根本の構成を変更する？
          /*
          WebAssembly.instantiate(event.data.wasm, {}).then((result) => {
            this.mainFn = result.instance.exports.main_fn;
            this.phaseFn = result.instance.exports.phase_fn;

            // audioNodeにwasmの関数が代入されたことを送信
            this.port.postMessage({ isInstancedWasm: true });
          });
          */
          await init(WebAssembly.compile(event.data.wasm)).then(() => {
            this.port.postMessage({ isInstancedWasm: true });
          });
          this.mainFn = main_fn;
          this.phaseFn = phase_fn;
        }

        if (event.data.type === "isPlayed") {
          this.isPlayed = event.data.isPlayed;
        }

        if (event.data.type === "oscillatorType") {
          this.oscillatorType = event.data.oscillatorType;
        }
      };
    }

    static get parameterDescriptors() {
      return [
        {
          name: "gain",
          defaultValue: 1,
          minValue: 0,
          maxValue: 1,
          automationRate: "a-rate", // a-rate or k-rate
        },
        {
          name: "pwmWidth",
          defaultValue: 0,
          minValue: -100,
          maxValue: 100,
          automationRate: "a-rate", // a-rate or k-rate
        },
      ];
    }

    /**
     * outputs: unknown[][][]; 出力の数 x Channel数 x 128(Audio Workletが一度に処理できる数)
     */
    //オーディオ処理の実装箇所
    process(_inputs, outputs, parameters) {
      if (!this.isPlayed) return false;

      // 複数の出力があった場合、最初のoutputsを取得
      let output = outputs[0];

      for (let channel = 0; channel < output.length; channel++) {
        output[channel].set(
          this.mainFn(
            this.oscillatorType,
            440.0,
            this.phase,
            sampleRate,
            parameters.pwmWidth[0],
            parameters.gain[0]
          )
        );
        this.phase = this.phaseFn(440.0, this.phase, sampleRate);
      }

      return true;
    }
  }
);
