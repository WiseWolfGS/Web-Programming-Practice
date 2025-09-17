use wasm_bindgen::prelude::*;

#[wasm_bindgen] 
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[wasm_bindgen] 
pub fn sum_f32(buf: &[f32]) -> f32 {
    buf.iter().sum()
}

#[wasm_bindgen] 
pub fn hello(name: &str) -> String {
    format!("Hello, {name} from Rust!")
}
