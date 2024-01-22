import init, {
  key_frequency_fn,
  oscillator_fn,
  synthesize_oscillator_fn,
  phase_fn,
  volume_fn,
} from "../pkg/audio_logic.js";

//"Audior"にAudioクラスを登録
registerProcessor(
  "Audio",
  class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
      super();

      this.keyFrequencyFn = null;
      this.oscillatorFn = null;
      this.synthesizeOscillatorFn = null;
      this.phase1Fn = null;
      this.volumeFn = null;
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
      this.size = 128;
      this.frame = 0;

      // audioNodeから受信したメッセージの処理
      this.port.onmessage = async (event) => {
        // wasmをコンパイルしてインスタンス化
        if (event.data.type === "wasm") {
          await init(WebAssembly.compile(event.data.wasm)).then(() => {
            this.port.postMessage({ isInstancedWasm: true });
          });
          this.keyFrequencyFn = key_frequency_fn;
          this.oscillatorFn = oscillator_fn;
          this.synthesizeOscillatorFn = synthesize_oscillator_fn;
          this.phaseFn = phase_fn;
          this.volumeFn = volume_fn;
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
          if (!this.isPlayed) {
            this.frame = 0;
          }
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

      this.frame += 128;

      // 複数の出力があった場合、最初のoutputsを取得
      let output = outputs[0];

      let keyFrequency = this.keyFrequencyFn(this.keyPitch, this.keyName);
      let oscillator1_out = this.oscillatorFn(
        this.oscillatorType1,
        keyFrequency,
        parameters.coarse1[0],
        parameters.fine1[0],
        parameters.pwmWidth1[0],
        this.phase1,
        parameters.gain1[0],
        sampleRate,
        this.size
      );
      let oscillator2_out = this.oscillatorFn(
        this.oscillatorType2,
        keyFrequency,
        parameters.coarse2[0],
        parameters.fine2[0],
        parameters.pwmWidth2[0],
        this.phase2,
        parameters.gain2[0],
        sampleRate,
        this.size
      );
      let oscillator3_out = this.oscillatorFn(
        this.oscillatorType3,
        keyFrequency,
        parameters.coarse3[0],
        parameters.fine3[0],
        parameters.pwmWidth3[0],
        this.phase3,
        parameters.gain3[0],
        sampleRate,
        this.size
      );

      let synthesizedOscillator = this.synthesizeOscillatorFn(
        oscillator1_out,
        oscillator2_out,
        oscillator3_out,
        this.size
      );

      let volume_out = volume_fn(
        synthesizedOscillator,
        0.01,
        parameters.masterVolume[0],
        0,
        1,
        this.size,
        sampleRate,
        this.frame
      );

      for (let channel = 0; channel < output.length; channel++) {
        output[channel].set(volume_out);

        this.phase1 = this.phaseFn(
          keyFrequency,
          parameters.coarse1[0],
          parameters.fine1[0],
          this.phase1,
          sampleRate
        );
        this.phase2 = this.phaseFn(
          keyFrequency,
          parameters.coarse2[0],
          parameters.fine2[0],
          this.phase2,
          sampleRate
        );
        this.phase3 = this.phaseFn(
          keyFrequency,
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
