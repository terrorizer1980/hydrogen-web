// @ts-ignore
import _downloadSandboxPath from "../../assets/download-sandbox.html?url";
// @ts-ignore
import _workerPath from "../../worker/main.js?url";
// @ts-ignore
import olmWasmPath from "@matrix-org/olm/olm.wasm?url";
// @ts-ignore
import olmJsPath from "@matrix-org/olm/olm.js?url";
// @ts-ignore
import olmLegacyJsPath from "@matrix-org/olm/olm_legacy.js?url";

export const olmPaths = {
    wasm: olmWasmPath,
    legacyBundle: olmLegacyJsPath,
    wasmBundle: olmJsPath,
};

export const downloadSandboxPath = _downloadSandboxPath;
export const workerPath = _workerPath;
