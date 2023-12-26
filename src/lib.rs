use wasm_bindgen::prelude::*;
use std::f64::consts::PI;

#[wasm_bindgen]
pub fn sine(phase: f64, sample_rate: f64) -> f64 {
    ((2.0 * PI * 440.0 * phase) / sample_rate).sin()
}

#[wasm_bindgen]
pub fn sawtooth(phase: f64, sample_rate: f64) -> f64 {
    ((2.0 * phase) / (sample_rate / 440.0)) - 1.0
}

// 矩形波
#[wasm_bindgen]
pub fn square(phase: f64, sample_rate: f64) -> f64 {
    match phase < (sample_rate / 440.0) / 2.0 {
        true => 0.2,
        false => -0.2
    }
}