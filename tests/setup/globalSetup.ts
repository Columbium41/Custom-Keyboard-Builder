import {loadTestEnv} from "./env";
import {resetTestDatabase} from "./db";

// runs once before the vitest run
export default function setup() {
    loadTestEnv();
    resetTestDatabase();
}
