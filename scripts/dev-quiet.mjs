




import { spawn } from 'node:child_process';



const FILTERS = [/\[baseline-browser-mapping\]/];

const shouldFilter = (text) => FILTERS.some((re) => re.test(text));


const makeFilter = (writeStream) => {
    let buffer = '';
    return (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? ''; 
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



const quoted = args.map((a) => (/\s/.test(a) ? `"${a}"` : a)).join(' ');
const command = `next dev${quoted ? ' ' + quoted : ''}`;









const NODE_OPTIONS_PARTS = [process.env.NODE_OPTIONS || '', '--dns-result-order=ipv4first']
    .filter(Boolean)
    .join(' ');

const child = spawn(command, {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
    env: { ...process.env, NODE_OPTIONS: NODE_OPTIONS_PARTS },
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


for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => child.kill(signal));
}
