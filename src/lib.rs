use wasm_bindgen::prelude::*;
use std::f32::consts::PI;
// use rand::Rng;
// use rand::prelude::*;

#[wasm_bindgen]
pub fn main_fn(oscillator_type1: &str, pwm_width1: f32, coarse1: f32, fine1: f32, gain1: f32, phase1: f32, oscillator_type2: &str, pwm_width2: f32, coarse2: f32, fine2: f32, gain2: f32, phase2: f32, oscillator_type3: &str, pwm_width3: f32, coarse3: f32, fine3: f32, gain3: f32, phase3: f32, key_name: &str, key_pitch: f32, sample_rate: f32, master_volume: f32) -> Vec<f32> {
  let mut block: Vec<f32> = Vec::with_capacity(128);
  let mut block1: Vec<f32> = Vec::with_capacity(128);
  let mut block2: Vec<f32> = Vec::with_capacity(128);
  let mut block3: Vec<f32> = Vec::with_capacity(128);

  let mut phase1 = phase1;
  let mut phase2 = phase2;
  let mut phase3 = phase3;

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

  let frequency1_tmp = if coarse1 >= 0.0 {
    frequency * 2f32.powf(coarse1 / 12.0)
  } else {
    (frequency / 2.0) * 2f32.powf( (12.0 + coarse1) / 12.0)
  };
  let frequency1 = if fine1 >= 0.0 {
    frequency1_tmp * 2f32.powf(fine1 / 100.0)
  } else {
    (frequency / 2.0) * 2f32.powf( (100.0 + fine1) / 100.0)
  };
  let frequency2_tmp = if coarse2 >= 0.0 {
    frequency * 2f32.powf(coarse2 / 12.0)
  } else {
    (frequency / 2.0) * 2f32.powf( (12.0 + coarse2) / 12.0)
  };
  let frequency2 = if fine2 >= 0.0 {
    frequency2_tmp * 2f32.powf(fine2 / 100.0)
  } else {
    (frequency / 2.0) * 2f32.powf( (100.0 + fine2) / 100.0)
  };
  let frequency3_tmp = if coarse3 >= 0.0 {
    frequency * 2f32.powf(coarse3 / 12.0)
  } else {
    (frequency / 2.0) * 2f32.powf( (12.0 + coarse3) / 12.0)
  };
  let frequency3 = if fine3 >= 0.0 {
    frequency3_tmp * 2f32.powf(fine3 / 100.0)
  } else {
    (frequency / 2.0) * 2f32.powf( (100.0 + fine3) / 100.0)
  };

  for i in 0..128 {
    match oscillator_type1 {
      "sine" => {
          block1.push(sine(frequency1, phase1, sample_rate, gain1));
        }
      "triangle" => {
        block1.push(triangle(frequency1, phase1, sample_rate, gain1));
      }
      "sawtooth" => {
        block1.push(sawtooth(frequency1, phase1, sample_rate, gain1));
      }
      "square" => {
        block1.push(square(frequency1, phase1, sample_rate, pwm_width1, gain1));
      }
      _ => {
        block1.push(0.0);
      }
    }
    match oscillator_type2 {
      "sine" => {
          block2.push(sine(frequency2, phase2, sample_rate, gain2));
        }
      "triangle" => {
        block2.push(triangle(frequency2, phase2, sample_rate, gain2));
      }
      "sawtooth" => {
        block2.push(sawtooth(frequency2, phase2, sample_rate, gain2));
      }
      "square" => {
        block2.push(square(frequency2, phase2, sample_rate, pwm_width2, gain2));
      }
      _ => {
        block2.push(0.0);
      }
    }
    match oscillator_type3 {
      "sine" => {
          block3.push(sine(frequency3, phase3, sample_rate, gain3));
        }
      "triangle" => {
        block3.push(triangle(frequency3, phase3, sample_rate, gain3));
      }
      "sawtooth" => {
        block3.push(sawtooth(frequency3, phase3, sample_rate, gain3));
      }
      "square" => {
        block3.push(square(frequency3, phase3, sample_rate, pwm_width3, gain3));
      }
      _ => {
        block3.push(0.0);
      }
    }

    block.push(master_volume * ((block1[i] + block2[i] + block3[i]) / (gain1 + gain2 + gain3)));

    phase1 += 1.0;
    if sample_rate / frequency1 <= phase1 {
      phase1 = 0.0;
    }
    phase2 += 1.0;
    if sample_rate / frequency2 <= phase2 {
      phase2 = 0.0;
    }
    phase3 += 1.0;
    if sample_rate / frequency3 <= phase3 {
      phase3 = 0.0;
    }
  }

  block
}

#[wasm_bindgen]
pub fn sine(frequency: f32, phase: f32, sample_rate: f32, gain: f32) -> f32 {
  gain * ((2.0 * PI * frequency * phase) / sample_rate).sin() 
}

#[wasm_bindgen]
pub fn triangle(frequency: f32, phase: f32, sample_rate: f32, gain: f32) -> f32 {
  match phase < ((sample_rate / frequency) / 2.0) {
    true => gain * (-1.0 + (4.0 * phase / (sample_rate / frequency))),
    false => gain * (3.0 - (4.0 * phase / (sample_rate / frequency)))
  }
}

#[wasm_bindgen]
pub fn sawtooth(frequency: f32, phase: f32, sample_rate: f32, gain: f32) -> f32 {
  gain * (((2.0 * phase) / (sample_rate / frequency)) - 1.0)
}

#[wasm_bindgen]
pub fn square(frequency: f32, phase: f32, sample_rate: f32, pwm_width: f32, gain: f32) -> f32 {
  match phase < ((sample_rate / frequency) / 2.0) - (((sample_rate / frequency) / 2.0) * pwm_width) {
    true => gain,
    false => -gain
  }
}

/*
#[wasm_bindgen]
pub fn ran() -> f32 {
  let mut rng = rand::thread_rng();
  2.0 * (rng.gen_range(0..100) as f32 - 0.5)
  // block.push(master_volume * (2.0 * (rng.gen::<f32>() - 0.5)));
}
*/

#[wasm_bindgen]
pub fn phase_fn(key_name: &str, key_pitch: f32, coarse: f32, fine: f32, phase: f32, sample_rate: f32) -> f32 {
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
      (standard_frequency / 2.0) * 2f32.powf(7.0 / 12.0)
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

  let mut phase = phase;

  let frequency_tmp = if coarse >= 0.0 {
    frequency * 2f32.powf(coarse / 12.0)
  } else {
    (frequency / 2.0) * 2f32.powf( (12.0 + coarse) / 12.0)
  };
  let frequency = if fine >= 0.0 {
    frequency_tmp * 2f32.powf(fine / 100.0)
  } else {
    (frequency / 2.0) * 2f32.powf( (100.0 + fine) / 100.0)
  };

  for _ in 0..128 {
    phase += 1.0;
    if sample_rate / frequency <= phase {
      phase = 0.0;
    }
  }
  phase
}