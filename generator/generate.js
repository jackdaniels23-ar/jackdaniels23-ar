const fs = require("fs");
const path = require("path");

const root = __dirname;
const profilePath = path.join(root, "config", "profile.json");
const profile = JSON.parse(fs.readFileSync(profilePath, "utf8"));
const asciiPath = path.join(root, "ascii.txt");
const checkOnly = process.argv.includes("--check");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeFile(relativePath, content) {
  const target = path.join(root, relativePath);
  ensureDir(path.dirname(target));
  const normalized = content.replace(/\r?\n/g, "\n");

  if (checkOnly) {
    if (!fs.existsSync(target)) {
      throw new Error(`${relativePath} is missing`);
    }
    const current = fs.readFileSync(target, "utf8").replace(/\r?\n/g, "\n");
    if (current !== normalized) {
      throw new Error(`${relativePath} is out of date; run npm run build`);
    }
    return;
  }

  fs.writeFileSync(target, normalized);
}

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function linesToTspans(lines, x, startY, step) {
  return lines
    .map((line, index) => `<tspan x="${x}" y="${startY + index * step}">${esc(line)}</tspan>`)
    .join("\n");
}

function trimAsciiLine(line) {
  return line.replace(/\s+$/g, "").slice(0, 82);
}

function asciiPortrait() {
  if (!fs.existsSync(asciiPath)) return ["ASCII PORTRAIT MISSING"];
  const lines = fs.readFileSync(asciiPath, "utf8")
    .replace(/\r/g, "")
    .split("\n")
    .map(trimAsciiLine)
    .filter((line) => line.trim().length > 0)
    .slice(0, 32);

  const minIndent = lines.reduce((min, line) => {
    const indent = line.match(/^\s*/)[0].length;
    return Math.min(min, indent);
  }, Infinity);

  return lines.map((line) => line.slice(Number.isFinite(minIndent) ? minIndent : 0));
}

function asciiTspans(lines, x, startY, step) {
  return lines
    .map((line, index) => `<tspan x="${x}" y="${startY + index * step}">${esc(line)}</tspan>`)
    .join("\n");
}

function typingTspans(lines) {
  return lines.map((line, index) => {
    const begin = `${(index * 1.8).toFixed(1).replace(/\.0$/, "")}s`;
    return `<tspan x="70" y="168" opacity="0">${esc(line)}<animate attributeName="opacity" values="0;1;1;0" dur="${lines.length * 1.8}s" begin="${begin}" repeatCount="indefinite"/></tspan>`;
  }).join("\n");
}

function bar(value, width = 10) {
  const filled = Math.max(0, Math.min(width, Math.round((Number(value) / 100) * width)));
  return `${"\u2588".repeat(filled)}${"\u2591".repeat(width - filled)}`;
}

function monitorLines() {
  return profile.systemMonitor.map(([label, value]) => {
    if (typeof value === "number") {
      return `${label.padEnd(10)} ${bar(value)} ${value}%`;
    }
    return `${label.padEnd(10)} ${value}`;
  });
}

function bannerSvg() {
  const face = asciiPortrait();
  const boot = [
    `root@${profile.terminalHost}:~$`,
  ];
  const monitor = [
    `Username : ${profile.username}`,
    "Role     : Cyber Forensics Student",
    "Project  : Shadow Linux",
    "Status   : ONLINE"
  ];

  return `<svg width="1200" height="440" viewBox="0 0 1200 440" fill="none" xmlns="http://www.w3.org/2000/svg">
<style>
  .panel{fill:#07110e;stroke:#2aff8a;stroke-width:2;filter:url(#glow)}
  .scan{animation:scan 5s linear infinite}
  .type{font:700 25px Consolas,Monaco,monospace;fill:#c8ffe1}
  .typing{font:800 24px Consolas,Monaco,monospace;fill:#42c8ff}
  .muted{font:600 18px Consolas,Monaco,monospace;fill:#67ffa5}
  .cursor{animation:blink 1s steps(1) infinite}
  .face{font:700 8px Consolas,Monaco,monospace;fill:#2aff8a;opacity:.82}
  .matrix{font:700 14px Consolas,Monaco,monospace;fill:#20ff7a;opacity:.18;animation:fall 7s linear infinite}
  @keyframes blink{50%{opacity:0}}
  @keyframes scan{0%{transform:translateY(-70px)}100%{transform:translateY(440px)}}
  @keyframes fall{0%{transform:translateY(-80px)}100%{transform:translateY(80px)}}
</style>
<defs>
  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="4" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
    <stop stop-color="#35ff9b"/><stop offset="1" stop-color="#42c8ff"/>
  </linearGradient>
</defs>
<rect width="1200" height="440" rx="18" fill="#020604"/>
<g class="matrix">
  <text x="34" y="30">1010101101010010110101101011010010101101</text>
  <text x="728" y="70">0010110101101010101101010010110101101010</text>
  <text x="70" y="370">1101010010110101101011010110010110101101</text>
  <text x="650" y="404">0101101010010110101101011010010101101001</text>
</g>
<rect x="28" y="28" width="1144" height="384" rx="16" class="panel"/>
<rect x="44" y="50" width="1112" height="36" rx="10" fill="#0e1f18" stroke="#1bdc76" opacity=".9"/>
<circle cx="70" cy="68" r="6" fill="#ff5f56"/><circle cx="92" cy="68" r="6" fill="#ffbd2e"/><circle cx="114" cy="68" r="6" fill="#27c93f"/>
<text x="570" y="73" text-anchor="middle" class="muted">root@${profile.terminalHost}:~ <tspan fill="#2aff8a">ONLINE</tspan></text>
<text class="type">${linesToTspans(boot, 70, 132, 35)}<tspan class="cursor"> &#9608;</tspan></text>
<text class="typing">${typingTspans(profile.bannerSequence)}</text>
<text class="muted">${linesToTspans(monitor, 70, 252, 30)}</text>
<text x="70" y="386" class="muted">root@${profile.terminalHost}:~$ cat skills.txt</text>
<g transform="translate(632 102)">
  <rect x="-20" y="-24" width="500" height="286" rx="14" fill="#06130f" stroke="url(#edge)" opacity=".74"/>
  <text class="face" xml:space="preserve">
${asciiTspans(face, 10, 0, 8)}
  </text>
</g>
<rect class="scan" x="46" y="0" width="1108" height="70" fill="#2aff8a" opacity=".08"/>
</svg>
`;
}

function matrixSvg() {
  const cols = Array.from({ length: 22 }, (_, i) => {
    const x = 20 + i * 54;
    const delay = (i % 7) * -0.55;
    const text = i % 2 ? "001011010110101" : "101010110101001";
    return `<text x="${x}" y="-220" style="animation-delay:${delay}s">${text}</text>`;
  }).join("\n");

  return `<svg width="1200" height="260" viewBox="0 0 1200 260" xmlns="http://www.w3.org/2000/svg">
<style>
  rect{fill:#020604}
  text{font:700 18px Consolas,Monaco,monospace;fill:#25ff83;opacity:.32;writing-mode:vertical-rl;animation:rain 6s linear infinite}
  @keyframes rain{to{transform:translateY(560px)}}
</style>
<rect width="1200" height="260"/>
${cols}
</svg>
`;
}

function themeSvg(theme) {
  const dark = theme === "dark";
  const bg = dark ? "#020604" : "#f6fff9";
  const fg = dark ? "#c8ffe1" : "#06351f";
  const accent = dark ? "#2aff8a" : "#008f4f";
  const sub = dark ? "#67ffa5" : "#146f45";
  const monitor = monitorLines();
  return `<svg width="1200" height="240" viewBox="0 0 1200 240" xmlns="http://www.w3.org/2000/svg">
<style>
  .title{font:800 34px Consolas,Monaco,monospace;fill:${fg}}
  .line{font:700 20px Consolas,Monaco,monospace;fill:${sub}}
  .blink{animation:blink 1s steps(1) infinite}@keyframes blink{50%{opacity:0}}
</style>
<rect width="1200" height="240" rx="14" fill="${bg}" stroke="${accent}" stroke-width="2"/>
<text x="46" y="62" class="title">SHADOW AI // STATUS: ONLINE</text>
<text class="line">${linesToTspans(monitor, 46, 106, 28)}</text>
<text x="46" y="214" class="line">root@${profile.terminalHost}:~$ <tspan class="blink">&#9608;</tspan></text>
</svg>
`;
}

function quoteSvg() {
  const dur = profile.quotes.length * 2.5;
  const tspans = profile.quotes.map((quote, index) => {
    const begin = `${(index * 2.5).toFixed(1).replace(/\.0$/, "")}s`;
    return `<tspan x="600" y="58" opacity="0">${esc(quote)}<animate attributeName="opacity" values="0;1;1;0" dur="${dur}s" begin="${begin}" repeatCount="indefinite"/></tspan>`;
  }).join("\n");

  return `<svg width="1200" height="96" viewBox="0 0 1200 96" xmlns="http://www.w3.org/2000/svg">
<style>
  rect{fill:#020604;stroke:#2aff8a;stroke-width:2}
  text{font:800 25px Consolas,Monaco,monospace;fill:#c8ffe1;text-anchor:middle}
</style>
<rect x="1" y="1" width="1198" height="94" rx="12"/>
<text>${tspans}</text>
</svg>
`;
}

function bootSvg() {
  const lines = [
    "BIOS v1.0",
    "Checking Memory........OK",
    "Loading Shadow Kernel...",
    "Loading AI Core...",
    "Loading Security Modules...",
    "Loading Terminal...",
    "Welcome",
    `root@${profile.terminalHost}:~$`
  ];

  return `<svg width="1200" height="310" viewBox="0 0 1200 310" xmlns="http://www.w3.org/2000/svg">
<style>
  rect{fill:#020604;stroke:#2aff8a;stroke-width:2}
  text{font:700 23px Consolas,Monaco,monospace;fill:#c8ffe1}
  .cursor{animation:blink 1s steps(1) infinite}@keyframes blink{50%{opacity:0}}
</style>
<rect x="1" y="1" width="1198" height="308" rx="14"/>
<text>${linesToTspans(lines, 46, 54, 32)}<tspan class="cursor"> &#9608;</tspan></text>
</svg>
`;
}

function badgesSvg() {
  const cols = 5;
  const itemWidth = 220;
  const itemHeight = 54;
  const rows = Math.ceil(profile.badges.length / cols);
  const badges = profile.badges.map(([label, color], index) => {
    const x = 40 + (index % cols) * itemWidth;
    const y = 34 + Math.floor(index / cols) * itemHeight;
    const hex = color.replace(/^#/, "");
    return `<g transform="translate(${x} ${y})"><rect width="190" height="34" rx="7" fill="#07110e" stroke="#${hex}"/><text x="95" y="23" text-anchor="middle">${esc(label)}</text></g>`;
  }).join("\n");

  return `<svg width="1200" height="${rows * itemHeight + 38}" viewBox="0 0 1200 ${rows * itemHeight + 38}" xmlns="http://www.w3.org/2000/svg">
<style>
  svg{background:#020604}
  text{font:800 16px Consolas,Monaco,monospace;fill:#c8ffe1}
</style>
${badges}
</svg>
`;
}

function avatarSvg() {
  return `<svg width="420" height="420" viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg">
<defs><filter id="g"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="420" height="420" rx="44" fill="#020604"/>
<path d="M210 58 326 125v134L210 326 94 259V125L210 58Z" fill="#07110e" stroke="#2aff8a" stroke-width="5" filter="url(#g)"/>
<path d="M210 92 292 140v96l-82 48-82-48v-96l82-48Z" fill="none" stroke="#42c8ff" stroke-width="4" opacity=".9"/>
<path d="M156 234h108M174 260h72M168 174l42-25 42 25M168 202l42 25 42-25" stroke="#2aff8a" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
<text x="210" y="84" text-anchor="middle" font-family="Consolas,monospace" font-size="28" font-weight="800" fill="#c8ffe1">SHADOW</text>
<text x="210" y="372" text-anchor="middle" font-family="Consolas,monospace" font-size="20" font-weight="700" fill="#67ffa5">LINUX</text>
</svg>
`;
}

function readme() {
  const langBadges = profile.languages
    .map((lang) => `![${lang}](https://img.shields.io/badge/${encodeURIComponent(lang)}-0b1411?style=for-the-badge&logoColor=2aff8a&labelColor=07110e&color=2aff8a)`)
    .join("\n");
  const projects = profile.projects
    .map((project) => `| [${project.name}](${project.url}) | ${project.description} |`)
    .join("\n");
  const ctfRows = profile.ctf
    .map((item) => `| [${item.platform}](${item.profileUrl}) | ${item.rank} | ${item.progress} | ${item.season} |`)
    .join("\n");
  const signalRows = profile.profileSignals
    .map(([label, value]) => `| ${label} | ${value} |`)
    .join("\n");
  const timelineRows = profile.timeline
    .map(([year, event]) => `| ${year} | ${event} |`)
    .join("\n");
  const commands = profile.commands
    .map(([cmd, href]) => `<a href="${href}"><code>${cmd}</code></a>`)
    .join(" | ");

  return `<!-- SHADOW TERMINAL PROFILE: generated by generate.js. Edit config/profile.json, then run npm run build. -->

<p align="center">
  <img src="./assets/banner.svg" alt="Shadow Terminal banner" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/${profile.username}?tab=repositories"><img alt="Repositories" src="https://img.shields.io/github/repos/${profile.username}?style=for-the-badge&label=Repos&labelColor=07110e&color=2aff8a"></a>
  <a href="https://github.com/${profile.username}?tab=followers"><img alt="Followers" src="https://img.shields.io/github/followers/${profile.username}?style=for-the-badge&label=Followers&labelColor=07110e&color=42c8ff"></a>
  <img alt="Profile visitors" src="https://komarev.com/ghpvc/?username=${profile.username}&style=for-the-badge&label=Visitors&color=2aff8a">
  <img alt="Shadow AI status" src="https://img.shields.io/badge/SHADOW_AI-ONLINE-2aff8a?style=for-the-badge&labelColor=07110e">
</p>

<a id="whoami"></a>

## root@${profile.terminalHost}:~$ whoami

\`\`\`txt
root@${profile.terminalHost}:~$ whoami
${profile.username}

root@${profile.terminalHost}:~$ cat about.txt
${profile.aboutLines.join("\n")}
\`\`\`

<p align="center">
  <img src="./assets/boot.svg" alt="Shadow Linux boot loader" width="100%" />
</p>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/light.svg">
  <img src="./assets/dark.svg" alt="Shadow AI system monitor" width="100%">
</picture>

<p align="center">
  <img src="./assets/avatar.svg" alt="Shadow Linux logo" width="180" />
</p>

<p align="center">
  <img src="./assets/quote.svg" alt="Rotating Shadow quote" width="100%" />
</p>

<a id="stats"></a>

## root@${profile.terminalHost}:~$ stats --live

<p align="center">
  <img height="170" alt="GitHub stats" src="https://github-readme-stats.vercel.app/api?username=${profile.username}&show_icons=true&theme=merko&hide_border=true&rank_icon=github&include_all_commits=true&custom_title=Shadow%20Terminal%20Stats" />
  <img height="170" alt="Top languages" src="https://github-readme-stats.vercel.app/api/top-langs/?username=${profile.username}&layout=compact&theme=merko&hide_border=true&langs_count=8" />
</p>

<p align="center">
  <img alt="GitHub streak" src="https://streak-stats.demolab.com?user=${profile.username}&theme=merko&hide_border=true&ring=2AFF8A&fire=42C8FF&currStreakLabel=2AFF8A" />
</p>

<p align="center">
  <img alt="Activity graph" src="https://github-readme-activity-graph.vercel.app/graph?username=${profile.username}&theme=github-compact&hide_border=true&area=true&custom_title=Shadow%20Activity%20Graph" />
</p>

<p align="center">
  <img alt="GitHub trophies" src="https://github-profile-trophy.vercel.app/?username=${profile.username}&theme=matrix&no-frame=true&no-bg=true&margin-w=8&row=1&column=6" />
</p>

<a id="snake"></a>

## root@${profile.terminalHost}:~$ snake --green

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/${profile.username}/${profile.username}/output/github-contribution-grid-snake-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/${profile.username}/${profile.username}/output/github-contribution-grid-snake.svg">
    <img alt="Contribution snake" src="https://raw.githubusercontent.com/${profile.username}/${profile.username}/output/github-contribution-grid-snake.svg">
  </picture>
</p>

<a id="matrix"></a>

## root@${profile.terminalHost}:~$ matrix --rain

<p align="center">
  <img src="./assets/matrix.svg" alt="Animated matrix rain" width="100%" />
</p>

<a id="skills"></a>

## root@${profile.terminalHost}:~$ skills

${langBadges}

<p align="center">
  <img src="./assets/badges.svg" alt="Technology badges" width="100%" />
</p>

| Signal | Source |
| --- | --- |
${signalRows}

<a id="timeline"></a>

## root@${profile.terminalHost}:~$ timeline

| Year | Milestone |
| --- | --- |
${timelineRows}

<a id="projects"></a>

## root@${profile.terminalHost}:~$ projects

| Project | Signal |
| --- | --- |
${projects}

<a id="terminal"></a>

## root@${profile.terminalHost}:~$ help

${commands}

\`\`\`txt
root@${profile.terminalHost}:~$ whoami
${profile.username}

root@${profile.terminalHost}:~$ cat skills.txt
${profile.profileSignals.map(([label]) => label).join(" | ")}

${profile.bootLines.join("\n")}

Shadow AI >
Ask me anything...
\`\`\`

<a id="ctf"></a>

## root@${profile.terminalHost}:~$ ctf --status

| Platform | Rank | Machines / Rooms | Season / Points |
| --- | --- | --- | --- |
${ctfRows}

Update real CTF progress in \`config/profile.json\`, then run \`npm run build\`.

<a id="contact"></a>

## root@${profile.terminalHost}:~$ contact

<p>
  <a href="https://github.com/${profile.username}"><img alt="GitHub" src="https://img.shields.io/badge/GitHub-${profile.username}-2aff8a?style=for-the-badge&logo=github&labelColor=07110e"></a>
  <a href="${profile.portfolioUrl}"><img alt="Portfolio" src="https://img.shields.io/badge/Portfolio-Shadow_Terminal-42c8ff?style=for-the-badge&labelColor=07110e"></a>
</p>
`;
}

function workflowSnake() {
  return `name: Generate contribution snake

on:
  schedule:
    - cron: "0 */12 * * *"
  workflow_dispatch:

permissions:
  contents: write

jobs:
  snake:
    runs-on: ubuntu-latest
    steps:
      - uses: Platane/snk/svg-only@v3
        with:
          github_user_name: ${profile.username}
          outputs: |
            dist/github-contribution-grid-snake.svg?palette=github-light&color_snake=#2aff8a
            dist/github-contribution-grid-snake-dark.svg?palette=github-dark&color_snake=#2aff8a
      - uses: crazy-max/ghaction-github-pages@v4
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;
}

function workflowMetrics() {
  return `name: Metrics

on:
  schedule:
    - cron: "20 0 * * *"
  workflow_dispatch:

permissions:
  contents: write

jobs:
  metrics:
    runs-on: ubuntu-latest
    steps:
      - uses: lowlighter/metrics@latest
        with:
          filename: assets/metrics.svg
          token: \${{ secrets.METRICS_TOKEN || secrets.GITHUB_TOKEN }}
          user: ${profile.username}
          template: classic
          base: header, activity, community, repositories, metadata
          config_timezone: ${profile.timezone}
          plugin_languages: yes
          plugin_languages_sections: most-used
          plugin_followup: yes
          plugin_stars: yes
`;
}

function workflowUpdate() {
  return `name: Rebuild profile

on:
  schedule:
    - cron: "45 18 * * *"
  workflow_dispatch:
  push:
    paths:
      - "config/profile.json"
      - "generate.js"

permissions:
  contents: write

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run build
      - name: Commit generated profile
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore: rebuild shadow terminal profile"
`;
}

function workflowBuild() {
  return `name: Build

on:
  pull_request:
  push:
    branches:
      - main
      - master

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm test
`;
}

writeFile("assets/banner.svg", bannerSvg());
writeFile("assets/matrix.svg", matrixSvg());
writeFile("assets/dark.svg", themeSvg("dark"));
writeFile("assets/light.svg", themeSvg("light"));
writeFile("assets/quote.svg", quoteSvg());
writeFile("assets/boot.svg", bootSvg());
writeFile("assets/badges.svg", badgesSvg());
writeFile("assets/avatar.svg", avatarSvg());
writeFile("README.md", readme());
writeFile(".github/workflows/snake.yml", workflowSnake());
writeFile(".github/workflows/metrics.yml", workflowMetrics());
writeFile(".github/workflows/update.yml", workflowUpdate());
writeFile(".github/workflows/build.yml", workflowBuild());

if (!checkOnly) {
  console.log("Shadow Terminal profile generated.");
}
