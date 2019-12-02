let lastMemoryUsage: NodeJS.MemoryUsage = null;
let lastMemoryUsageDiff: NodeJS.MemoryUsage = null;
let memoryUsageDiffAcc: NodeJS.MemoryUsage = null;

function bytesToMB(value: number) {
    return Math.round((value / 1024 / 1024) * 100) / 100;
}

function printMemoryUsage(memoryUsage: NodeJS.MemoryUsage, prefix: string) {
    console.log(`[${prefix}] RSS: ${bytesToMB(memoryUsage.rss)} MB`);
    console.log(`[${prefix}] Heap Total: ${bytesToMB(memoryUsage.heapTotal)} MB`);
    console.log(`[${prefix}] Heap Used: ${bytesToMB(memoryUsage.heapUsed)} MB`);
    console.log(`[${prefix}] External: ${bytesToMB(memoryUsage.external)} MB`);
}

setInterval(() => {
    const currentMemoryUsage = process.memoryUsage();
    if (lastMemoryUsage == null) lastMemoryUsage = currentMemoryUsage;
    if (lastMemoryUsageDiff == null) lastMemoryUsageDiff = {rss: 0, heapTotal: 0, heapUsed: 0, external: 0};
    if (memoryUsageDiffAcc == null) memoryUsageDiffAcc = {rss: 0, heapTotal: 0, heapUsed: 0, external: 0};
    let memoryUsageDiff = {
        rss:        currentMemoryUsage.rss - lastMemoryUsage.rss,
        heapTotal:  currentMemoryUsage.heapTotal - lastMemoryUsage.heapTotal,
        heapUsed:   currentMemoryUsage.heapUsed - lastMemoryUsage.heapUsed,
        external:   currentMemoryUsage.external - lastMemoryUsage.external
    };
    memoryUsageDiffAcc = {
        rss:        memoryUsageDiffAcc.rss + memoryUsageDiff.rss,
        heapTotal:  memoryUsageDiffAcc.heapTotal + memoryUsageDiff.heapTotal,
        heapUsed:   memoryUsageDiffAcc.heapUsed + memoryUsageDiff.heapUsed,
        external:   memoryUsageDiffAcc.external + memoryUsageDiff.external,
    }
    printMemoryUsage(currentMemoryUsage, "Current");
    printMemoryUsage(memoryUsageDiff, "Diff");
    printMemoryUsage(memoryUsageDiffAcc, "DiffAcc");
    // console.log(`Memory usage: ${JSON.stringify(process.memoryUsage(), undefined, 2)}`);
    lastMemoryUsage = currentMemoryUsage;
    lastMemoryUsageDiff = memoryUsageDiff;
}, 5000);
