use wasm_bindgen::prelude::*;
use std::f64::consts::PI;
// use rand::Rng;
// use rand::prelude::*;

#[wasm_bindgen]
pub fn main_fn(oscillator_type: &str, frequency: f64, phase: f64, sample_rate: f64, pwm_width: f64, gain: f64) -> Vec<f64> {
  let mut block: Vec<f64> = Vec::with_capacity(128);
  let mut phase = phase;

  for _ in 0..128 {
    match oscillator_type {
      "sine" => {
          block.push(gain * sine(frequency, phase, sample_rate));
          phase += 1.0;
        }
      "triangle" => {
        block.push(gain * triangle(frequency, phase, sample_rate));
        phase += 1.0;
      }
      "sawtooth" => {
        block.push(gain * sawtooth(frequency, phase, sample_rate));
        phase += 1.0;
      }
      "square" => {
        block.push(gain * square(frequency, phase, sample_rate, pwm_width));
        phase += 1.0;
      }
      "noise" => {
        /*
        let mut rng = rand::thread_rng();
        block.push(gain * (2.0 * (rng.gen::<f64>() - 0.5)))
        */
        block.push(0.0);
        phase += 1.0;
      }
      _ => {
        block.push(0.0);
        phase += 1.0;
      }
    }

    if sample_rate / frequency <= phase {
      phase = 0.0;
    }
  }

  block
}

#[wasm_bindgen]
pub fn sine(frequency: f64, phase: f64, sample_rate: f64) -> f64 {
  ((2.0 * PI * frequency * phase) / sample_rate).sin() 
}

#[wasm_bindgen]
pub fn triangle(frequency: f64, phase: f64, sample_rate: f64) -> f64 {
  match phase < ((sample_rate / frequency) / 2.0) {
    true => -1.0 + (4.0 * phase / (sample_rate / frequency)),
    false => 3.0 - (4.0 * phase / (sample_rate / frequency))
  }
}

#[wasm_bindgen]
pub fn sawtooth(frequency: f64, phase: f64, sample_rate: f64) -> f64 {
  ((2.0 * phase) / (sample_rate / frequency)) - 1.0
}

#[wasm_bindgen]
pub fn square(frequency: f64, phase: f64, sample_rate: f64, pwm_width: f64) -> f64 {
  match phase < ((sample_rate / frequency) / 2.0) - (((sample_rate / frequency) / 2.0) * pwm_width) {
    true => 1.0,
    false => -1.0
  }
}

#[wasm_bindgen]
pub fn phase_fn(frequency: f64, phase: f64, sample_rate: f64) -> f64 {
  let mut phase = phase;
  for _ in 0..128 {
    if sample_rate / frequency <= phase {
      phase = 0.0;
    }
    phase += 1.0;
  }
  phase
}