import { cpSync } from "fs";
import { resolve } from "path";

const src = resolve("shared");
const dest = resolve("dist", "shared");

cpSync(src, dest, { recursive: true });
