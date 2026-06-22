import { timeStamp } from "console";
import { APIResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { checkDB } from "../utils/checkDB.js";
import { checkMemory } from "../utils/checkMemory.js";
import { readFileSync } from "fs"
import { resolve } from "path";


const formatUptime = (seconds) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    return `${d}d ${h}h ${m}m ${s}s`;
};

const resolveOverallStatus = (checks) => {
    const statuses = Object.values(checks).map((c) => c.status);


    if (statuses.includes("down") || statuses.includes("critical"))
        return "unhealthy";

    if (statuses.includes("degraded"))
        return "degraded";

    return "healthy";
};

const statusToHttpCode = (overall) => {
    if (overall === "unhealthy")
        return 503;

    if (overall === "degraded")
        return 207;

    return 200;
};


const healthCheck = asyncHandler(async (req, res) => {
    const [dbResult, memResult] = await Promise.allSettled([
        checkDB(),
        checkMemory()
    ])

    const checks = {
        database: dbResult.status === "fulfilled" ?
            dbResult.value : { status: "down", error: dbResult.reason.message ?? "Unknown" },
        memory: memResult.status === "fulfilled" ?
            memResult.value : { status: "degraded", error: memResult.reason.message ?? "unknown" }
    }

    const overall = resolveOverallStatus(checks);
    const httpCode = statusToHttpCode(overall);

    const payload = {
        status: overall,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV ?? "development",
        uptime: {
            process: formatUptime(process.uptime()),
            processSeconds: Math.floor(process.uptime()),
        },
        checks,
    };

    return res.status(httpCode).json(
        new APIResponse(httpCode, payload, `Health CHeck ${overall}`)
    )


});

export {
    healthCheck
}