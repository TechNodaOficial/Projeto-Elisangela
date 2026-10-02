// Copia o WebAssembly do leitor de QR (zxing-wasm) para public/, para o site servir
// o arquivo ele mesmo em vez de buscar numa CDN externa no meio da festa.
// O nome leva a versão (a mesma que o leitor usa para montar a URL), então trocar
// de versão troca a URL e o cache longo não serve um arquivo velho.
import { copyFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

import { ZXING_WASM_VERSION } from "barcode-detector/ponyfill";

const origem = path.join(process.cwd(), "node_modules/zxing-wasm/dist/reader/zxing_reader.wasm");
const pasta = path.join(process.cwd(), "public/zxing");

mkdirSync(pasta, { recursive: true });
for (const antigo of readdirSync(pasta)) rmSync(path.join(pasta, antigo));
copyFileSync(origem, path.join(pasta, `zxing_reader-${ZXING_WASM_VERSION}.wasm`));
console.log(`zxing_reader-${ZXING_WASM_VERSION}.wasm copiado para public/zxing`);
