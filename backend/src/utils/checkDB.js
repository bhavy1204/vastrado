import mongoose from "mongoose"

export const checkDB = async () => {
    const state = mongoose.connection.readyState;

    const stateMap = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };

    if (state !== 1) {
        return { status: "down", state: stateMap[state] ?? "unknown" };
    }

    const start = Date.now();

    await mongoose.connection.db.admin().ping();
    return {
        status: "ok",
        state: "connected",
        latency: Date.now() - start
    }
}




