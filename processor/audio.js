import init, { main_fn, phase_fn } from "../pkg/audio_logic.js";

//"Audior"にAudioクラスを登録
registerProcessor(
  "Audio",
  class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
      super();

      this.mainFn = null;
      this.phase1Fn = null;
      this.phase1 = 0;
      this.phase2Fn = null;
      this.phase2 = 0;
      this.phase3Fn = null;
      this.phase3 = 0;
      this.oscillatorType1 = "sine";
      this.oscillatorType2 = "sine";
      this.oscillatorType3 = "sine";
      this.keyName = "a";
      this.keyPitch = 4;
      this.isPlayed = false;

      // audioNodeから受信したメッセージの処理
      this.port.onmessage = async (event) => {
        // wasmをコンパイルしてインスタンス化
        if (event.data.type === "wasm") {
          await init(WebAssembly.compile(event.data.wasm)).then(() => {
            this.port.postMessage({ isInstancedWasm: true });
          });
          this.mainFn = main_fn;
          this.phaseFn = phase_fn;
        }

        if (event.data.type === "oscillatorType1") {
          this.oscillatorType1 = event.data.oscillatorType1;
        }
        if (event.data.type === "oscillatorType2") {
          this.oscillatorType2 = event.data.oscillatorType2;
        }
        if (event.data.type === "oscillatorType3") {
          this.oscillatorType3 = event.data.oscillatorType3;
        }
        if (event.data.type === "keyName") {
          this.keyName = event.data.keyName;
        }
        if (event.data.type === "keyPitch") {
          this.keyPitch = event.data.keyPitch;
        }

        if (event.data.type === "isPlayed") {
          this.isPlayed = event.data.isPlayed;
        }
      };
    }

    static get parameterDescriptors() {
      return [
        {
          name: "masterVolume",
          defaultValue: 1,
          minValue: 0,
          maxValue: 1,
          automationRate: "a-rate", // a-rate or k-rate
        },
        {
          name: "pwmWidth1",
          defaultValue: 0,
          minValue: -100,
          maxValue: 100,
          automationRate: "a-rate",
        },
        {
          name: "coarse1",
          defaultValue: 0,
          minValue: -12,
          maxValue: 12,
          automationRate: "k-rate",
        },
        {
          name: "fine1",
          defaultValue: 0,
          minValue: -100,
          maxValue: 100,
          automationRate: "a-rate",
        },
        {
          name: "gain1",
          defaultValue: 1,
          minValue: 0,
          maxValue: 1,
          automationRate: "a-rate",
        },
        {
          name: "pwmWidth2",
          defaultValue: 0,
          minValue: -100,
          maxValue: 100,
          automationRate: "a-rate",
        },
        {
          name: "coarse2",
          defaultValue: 0,
          minValue: -12,
          maxValue: 12,
          automationRate: "k-rate",
        },
        {
          name: "fine2",
          defaultValue: 0,
          minValue: -100,
          maxValue: 100,
          automationRate: "a-rate",
        },
        {
          name: "gain2",
          defaultValue: 1,
          minValue: 0,
          maxValue: 1,
          automationRate: "a-rate",
        },
        {
          name: "pwmWidth3",
          defaultValue: 0,
          minValue: -100,
          maxValue: 100,
          automationRate: "a-rate",
        },
        {
          name: "coarse3",
          defaultValue: 0,
          minValue: -12,
          maxValue: 12,
          automationRate: "k-rate",
        },
        {
          name: "fine3",
          defaultValue: 0,
          minValue: -100,
          maxValue: 100,
          automationRate: "a-rate",
        },
        {
          name: "gain3",
          defaultValue: 1,
          minValue: 0,
          maxValue: 1,
          automationRate: "a-rate",
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
            this.oscillatorType1,
            parameters.pwmWidth1[0],
            parameters.coarse1[0],
            parameters.fine1[0],
            parameters.gain1[0],
            this.phase1,
            this.oscillatorType2,
            parameters.pwmWidth2[0],
            parameters.coarse2[0],
            parameters.fine2[0],
            parameters.gain2[0],
            this.phase2,
            this.oscillatorType3,
            parameters.pwmWidth3[0],
            parameters.coarse3[0],
            parameters.fine3[0],
            parameters.gain3[0],
            this.phase3,
            this.keyName,
            this.keyPitch,
            sampleRate,
            parameters.masterVolume[0]
          )
        );

        this.phase1 = this.phaseFn(
          this.keyName,
          this.keyPitch,
          parameters.coarse1[0],
          parameters.fine1[0],
          this.phase1,
          sampleRate
        );
        this.phase2 = this.phaseFn(
          this.keyName,
          this.keyPitch,
          parameters.coarse2[0],
          parameters.fine2[0],
          this.phase2,
          sampleRate
        );
        this.phase3 = this.phaseFn(
          this.keyName,
          this.keyPitch,
          parameters.coarse3[0],
          parameters.fine3[0],
          this.phase3,
          sampleRate
        );
      }

      return true;
    }
  }
);
