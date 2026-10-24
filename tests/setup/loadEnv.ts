import {loadTestEnv} from "./env";

// first setup file, so the test env is in place before any app module reads process.env
loadTestEnv();
