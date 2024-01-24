use wasm_bindgen::prelude::*;
use std::f32::consts::{PI, E};
// use rand::Rng;
// use rand::prelude::*;

// キー名を周波数に変換
#[wasm_bindgen]
pub fn key_frequency_fn(key_pitch: f32, key_name: &str) -> f32 {
  let standard_frequency = if key_pitch >= 4.0 {
    440.0 * 2f32.powf(key_pitch - 4.0)
  } else if key_pitch > 0.0 {
    440.0 / 2f32.powf(4.0 - key_pitch)
  } else {
    440.0 / 2f32.powf(4.0 + key_pitch)
  }; 

  let frequency = match key_name {
    "a" => {
      standard_frequency
    }
    "as" => {
      standard_frequency * 2f32.powf(1.0 / 12.0)
    }
    "b" => {
      standard_frequency * 2f32.powf(2.0 / 12.0)
    }
    "c" => {
      (standard_frequency / 2.0) * 2f32.powf(3.0 / 12.0)
    }
    "cs" => {
      (standard_frequency / 2.0) * 2f32.powf(4.0 / 12.0)
    }
    "d" => {
      (standard_frequency / 2.0) * 2f32.powf(5.0 / 12.0)
    }
    "ds" => {
      (standard_frequency / 2.0) * 2f32.powf(6.0 / 12.0)
    }
    "e" => {
      (standard_frequency / 2.0) * 2f32.powf(7.0/ 12.0)
    }
    "f" => {
      (standard_frequency / 2.0) * 2f32.powf(8.0 / 12.0)
    }
    "fs" => {
      (standard_frequency / 2.0) * 2f32.powf(9.0 / 12.0)
    }
    "g" => {
      (standard_frequency / 2.0) * 2f32.powf(10.0 / 12.0)
    }
    "gs" => {
      (standard_frequency / 2.0) * 2f32.powf(11.0 / 12.0)
    }
    _ => {
      standard_frequency
    }
  };

  frequency
}

// 引数size(128)分のサンプルを作成
#[wasm_bindgen]
pub fn oscillator_fn(oscillator_type: &str, key_frequency: f32, coarse: f32, fine: f32, pwm_width: f32, phase: f32, gain: f32, sample_rate: f32, size: usize) -> Vec<f32> {
  let mut block: Vec<f32> = Vec::with_capacity(size); 
  let mut phase = phase;

  let frequency_tmp = if coarse >= 0.0 {
    key_frequency * 2f32.powf(coarse / 12.0)
  } else {
    (key_frequency / 2.0) * 2f32.powf((12.0 + coarse) / 12.0)
  };
  let frequency = if fine >= 0.0 {
    frequency_tmp * (2f32.powf(1.0 / 12.0)).powf(fine / 100.0)
  } else {
    (frequency_tmp / 2.0) * 2f32.powf(11.0 / 12.0) * (2f32.powf(1.0 / 12.0)).powf((100.0 + fine) /100.0)
  };

  for _ in 0..size {
    match oscillator_type {
      "sine" => {
          block.push(gain * sine(frequency, phase, sample_rate, gain));
        }
      "triangle" => {
        block.push(gain * triangle(frequency, phase, sample_rate, gain));
      }
      "sawtooth" => {
        block.push(gain * sawtooth(frequency, phase, sample_rate, gain));
      }
      "square" => {
        block.push(gain * square(frequency, phase, sample_rate, pwm_width, gain));
      }
      _ => {
        block.push(0.0);
      }
    }

    phase += 1.0;
    if sample_rate / frequency <= phase {
      phase = 0.0;
    }
  }

  block
}

// oscillatorの各サンプル1つずつ同士を足し合わせ
#[wasm_bindgen]
pub fn synthesize_oscillator_fn(oscillator1: Vec<f32>, oscillator2: Vec<f32>, oscillator3: Vec<f32>, size: usize) -> Vec<f32> {
  let mut block: Vec<f32> = Vec::with_capacity(size);
  for i in 0..size {
    block.push(oscillator1[i] + oscillator2[i] + oscillator3[i]);
  }

  block
}

// 命名は仮、input_inとか被りまくりなのであとから考慮
#[wasm_bindgen]
pub fn filter_fn(input_block: Vec<f32>, input_in1: f32, input_in2: f32, input_out1: f32, input_out2: f32, frequency: f32, sample_rate: f32, resonance: f32, size: usize) -> Vec<f32> {
  let mut block: Vec<f32> = Vec::with_capacity(size);
  
  let omega = 2.0 * PI * frequency / sample_rate;
  let alpha = (omega).sin() / (2.0 * resonance);

  // NOTE: JS側がfloat32でしか受け取ることができない
  let a0: f32 = 1.0 + alpha;
  let a1: f32 = -2.0 * omega.cos();
  let a2: f32 = 1.0 - alpha;
  let b0: f32 = (1.0 - omega.cos()) / 2.0;
  let b1: f32 = 1.0 - omega.cos();
  let b2: f32 = (1.0 - omega.cos()) / 2.0;

  let mut in1: f32 = input_in1;
  let mut in2: f32 = input_in2;
  let mut out1: f32 = input_out1;
  let mut out2: f32 = input_out2;

  for i in 0..size {
    let filtered_block = b0/a0 * input_block[i] + b1/a0 * in1 + b2/a0 * in2 - a1/a0 * out1 - a2/a0 * out2;
    block.push(filtered_block);

    in2 = in1;
    in1 = input_block[i];
    out2 = out1;
    out1 = filtered_block;
  }

  block
}

// 正弦波の式
#[wasm_bindgen]
pub fn sine(frequency: f32, phase: f32, sample_rate: f32, gain: f32) -> f32 {
  gain * ((2.0 * PI * frequency * phase) / sample_rate).sin() 
}

// 三角波の式
#[wasm_bindgen]
pub fn triangle(frequency: f32, phase: f32, sample_rate: f32, gain: f32) -> f32 {
  match phase < ((sample_rate / frequency) / 2.0) {
    true => gain * (-1.0 + (4.0 * phase / (sample_rate / frequency))),
    false => gain * (3.0 - (4.0 * phase / (sample_rate / frequency)))
  }
}

// ノコギリ波の式
#[wasm_bindgen]
pub fn sawtooth(frequency: f32, phase: f32, sample_rate: f32, gain: f32) -> f32 {
  gain * (((2.0 * phase) / (sample_rate / frequency)) - 1.0)
}

// 矩形波の式
#[wasm_bindgen]
pub fn square(frequency: f32, phase: f32, sample_rate: f32, pwm_width: f32, gain: f32) -> f32 {
  match phase < ((sample_rate / frequency) / 2.0) - (((sample_rate / frequency) / 2.0) * pwm_width) {
    true => gain,
    false => -gain
  }
}

// ノイズの式
/*
#[wasm_bindgen]
pub fn ran() -> f32 {
  let mut rng = rand::thread_rng();
  2.0 * (rng.gen_range(0..100) as f32 - 0.5)
  // block.push(master_volume * (2.0 * (rng.gen::<f32>() - 0.5)));
}
*/

// 周期の式
#[wasm_bindgen]
pub fn phase_fn(key_frequency: f32, coarse: f32, fine: f32, phase: f32, sample_rate: f32) -> f32 {
  let mut phase = phase;

  let frequency_tmp = if coarse >= 0.0 {
    key_frequency * 2f32.powf(coarse / 12.0)
  } else {
    (key_frequency / 2.0) * 2f32.powf((12.0 + coarse) / 12.0)
  };
  let frequency = if fine >= 0.0 {
    frequency_tmp * (2f32.powf(1.0 / 12.0)).powf(fine / 100.0)
  } else {
    (frequency_tmp / 2.0) * 2f32.powf(11.0 / 12.0) * (2f32.powf(1.0 / 12.0)).powf((100.0 + fine) /100.0)
  };

  for _ in 0..128 {
    phase += 1.0;
    if sample_rate / frequency <= phase {
      phase = 0.0;
    }
  }
  phase
}

// Master Volumeの式
#[wasm_bindgen]
pub fn volume_fn(array: Vec<f32>, start_value: f32, end_value: f32, start_time: f32, end_time: f32, size: u32, sample_rate: f32, current_frame: f32) -> Vec<f32>  {
  let mut block: Vec<f32> = Vec::with_capacity(size as usize);
  let sample_cycle = 1.0 / sample_rate;

  for i in 0..size {
    let time = sample_cycle * (i as f32 + (128.0 * (current_frame / 128.0 - 1.0)));
    let block_tmp = array[i as usize];
    // let block_tmp = array[i as usize] * exponential_ramp_to_value_at_time(start_value, end_value, start_time, end_time, time);
    // let block_tmp = array[i as usize] * linear_ramp_to_value_at_time(start_value, end_value, start_time, end_time, time);
    // let block_tmp = array[i as usize] * set_target_at_time(start_value, end_value, start_time, end_time, time);
    // let block_tmp = array[i as usize] * set_value_curve_at_time(vec![0.0, 1.0, 1.0, 0.01, 1.0, 0.0, 0.5], start_time, 6.0, time);
    block.push(block_tmp);
  }

  block
}

#[wasm_bindgen]
pub fn exponential_ramp_to_value_at_time(start_value: f32, end_value: f32, start_time: f32, end_time:f32, time: f32) -> f32 {
  if start_time <= time && time < end_time {
    start_value * (end_value / start_value).powf((time - start_time) / (end_time - start_time))
  } else {
    end_value
  }
}

#[wasm_bindgen]
pub fn linear_ramp_to_value_at_time(start_value: f32, end_value: f32, start_time: f32, end_time:f32, time: f32) -> f32 {
    if start_time <= time && time < end_time {
    start_value + (end_value -  start_value) * ((time - start_time) / (end_time - start_time))
  } else {
    end_value
  }
}

#[wasm_bindgen]
pub fn set_target_at_time(start_value: f32, target: f32, start_time: f32, time_constant:f32, time: f32) -> f32 {
  target + (start_value - target) * E.powf(-((time - start_time) / time_constant))
}

// 作業中
#[wasm_bindgen]
pub fn set_value_curve_at_time(values: Vec<f32>, start_time: f32, duration: f32, time: f32) -> f32 {
  let seconds_per_interval = duration / (values.len() - 1) as f32;

  if ((time / seconds_per_interval).floor() as usize) < (values.len() - 1) {
    let v_0 = values[(time / seconds_per_interval).floor() as usize];
    let v_1 = values[(time / seconds_per_interval).floor() as usize + 1];
    let t_0 = start_time + seconds_per_interval * (time / seconds_per_interval).floor();
    let t_1 = start_time + seconds_per_interval * ((time / seconds_per_interval).floor() + 1.0);

    if ((time / seconds_per_interval).floor() as usize) < 1 {
      linear_ramp_to_value_at_time(v_0, v_1, t_0, t_1, time)
    } else {
      linear_ramp_to_value_at_time(v_0, v_1, t_0, t_1, time)
    }
  } else {
    values[values.len() - 1]
  }
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: f32);
}