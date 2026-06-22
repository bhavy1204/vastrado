const HEAP_WARN_MB = 400;
const HEAP_ERROR_MB = 700;

export const checkMemory = () => {
    const mem = process.memoryUsage();
    const toMb = (b) => +(b / 1024 / 1024).toFixed(2);

    const heapUsedMb = toMb(mem.heapUsed);
    const heapTotalMb = toMb(mem.heapTotal);
    const rssMb = toMb(mem.rss);
    const externalMb = toMb(mem.external);

    let status = "ok";
    
    if (heapUsedMb >= HEAP_ERROR_MB) status = "critical";
    else if (heapUsedMb >= HEAP_WARN_MB) status = "degraded";

    return { status, heapUsedMb, heapTotalMb, rssMb, externalMb };
};