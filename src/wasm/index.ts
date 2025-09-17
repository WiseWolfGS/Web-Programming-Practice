import init, * as wasm from "./pkg/wasm_core";

let ready: Promise<typeof wasm> | null = null;

export function loadWasm() {
    if (!ready) ready = init().then(() => wasm);
    return ready;
}