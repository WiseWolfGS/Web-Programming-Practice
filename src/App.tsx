import {useEffect, useState} from "react";
import { loadWasm } from "./wasm";

export default function App() {
    const [msg, setMsg] = useState("Loading...");

    useEffect(() => {
        loadWasm().then(w => {
            const sum = w.add(21, 21);
            const greet = w.hello("React");
            setMsg(`${greet} | sum=${sum}`);
        });
    }, []);

    return <main style={{ padding: 24 }}><h1>{msg}</h1></main>;
}