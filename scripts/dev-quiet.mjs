// scripts/dev-quiet.mjs — Wrapper untuk `next dev` yang filter warning kosmetik
// dari baseline-browser-mapping (di-bundle Next.js, tidak honor env var suppress).
//
// Cara pakai: package.json "dev": "node scripts/dev-quiet.mjs"

import { spawn } from 'node:child_process';

// Pattern line yang mau dibuang dari output. Tambah pattern lain di sini kalau
// muncul warning kosmetik lain yang bikin terganggu.
const FILTERS = [/\[baseline-browser-mapping\]/];

const shouldFilter = (text) => FILTERS.some((re) => re.test(text));

// Filter line-by-line tapi preserve chunk boundaries (penting untuk spinner Turbopack)
const makeFilter = (writeStream) => {
    let buffer = '';
    return (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? ''; // line terakhir mungkin partial, simpan untuk next chunk
        for (const line of lines) {
            if (!shouldFilter(line)) writeStream.write(line + '\n');
        }
    };
};

const flushBuffer = (writeStream, getBuffer) => {
    const remaining = getBuffer();
    if (remaining && !shouldFilter(remaining)) writeStream.write(remaining);
};

const args = process.argv.slice(2);

// Pass full command sebagai single string ke shell — menghindari DEP0190
// (deprecation warning ketika shell:true + args array).
const quoted = args.map((a) => (/\s/.test(a) ? `"${a}"` : a)).join(' ');
const command = `next dev${quoted ? ' ' + quoted : ''}`;

const child = spawn(command, {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
    env: process.env,
});

let stdoutBuffer = '';
let stderrBuffer = '';

const stdoutFilter = makeFilter(process.stdout);
const stderrFilter = makeFilter(process.stderr);

child.stdout.on('data', (chunk) => {
    stdoutBuffer += chunk.toString();
    stdoutFilter(chunk);
});
child.stderr.on('data', (chunk) => {
    stderrBuffer += chunk.toString();
    stderrFilter(chunk);
});

const cleanup = (code) => {
    flushBuffer(process.stdout, () => stdoutBuffer.split('\n').pop() ?? '');
    flushBuffer(process.stderr, () => stderrBuffer.split('\n').pop() ?? '');
    process.exit(code ?? 0);
};

child.on('exit', cleanup);
child.on('error', (err) => {
    console.error('Failed to start next dev:', err);
    process.exit(1);
});

// Forward signals supaya Ctrl+C bersih
for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => child.kill(signal));
}
