use wasm_bindgen::prelude::*;
use std::f64::consts::PI;

// 正弦波
#[wasm_bindgen]
pub fn sine(phase: f64, sample_rate: f64) -> f64 {
    ((2.0 * PI * 440.0 * phase) / sample_rate).sin()
}

// ノコギリ波
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

// https://weblike-curtaincall.ssl-lolipop.jp/portfolio-web-sounder/webaudioapi-basic/custom#:~:text=0%20%3C%3D%20phase%20%3C%20t0-,%E4%B8%89%E8%A7%92%E6%B3%A2,-var%20t0%20%3D%20sampleRate
// 三角波
#[wasm_bindgen]
pub fn triangle(phase: f64, sample_rate: f64) -> f64 {
    let t0 = sample_rate / 440.0;
    let s = 4.0 * phase / t0;
    match phase < (t0 / 2.0) {
        true => -1.0 + s,
        false => 3.0 - s
    }
}