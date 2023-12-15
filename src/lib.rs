use wasm_bindgen::prelude::*;
use std::f64::consts::PI;

#[wasm_bindgen]
pub fn sine(current_frame: f64, sample_rate: f64, i: f64) -> f64 {
    0.5 * ((440.0 * 2.0 * PI * (current_frame + i)) / sample_rate).sin()
}