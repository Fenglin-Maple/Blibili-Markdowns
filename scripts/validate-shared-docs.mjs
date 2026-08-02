import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const metadataName = '_star-owner-document.json';
const namespaces = new Set(['bilibili', 'single', 'multipart']);
const allowedExtensions = new Set(['.md', '.json', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif']);
const forbiddenNames = /(?:cookie|secret|api[-_]?key|token|credential|database|sqlite|session)/i;
const errors = [];

function relative(file) { return path.relative(root, file).split(path.sep).join('/'); }
function walk(directory) {
  const output = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...walk(file));
    else if (entry.isFile()) output.push(file);
  }
  return output;
}
function fail(message) { errors.push(message); }
function safeRelative(value) {
  const normalized = String(value || '').replaceAll('\\', '/');
  return Boolean(normalized) && !normalized.startsWith('/') && !normalized.split('/').some((part) => !part || part === '.' || part === '..');
}

const metadataFiles = walk(root).filter((file) => path.basename(file) === metadataName);
for (const metadataFile of metadataFiles) {
  const metadataPath = relative(metadataFile);
  const segments = metadataPath.split('/');
  if (segments.length < 5) {
    fail(`${metadataPath}: 路径层级不足`);
    continue;
  }
  const [contributor, namespace, collection, document, fileName] = segments.slice(-5);
  if (!/^\d+$/.test(contributor)) fail(`${metadataPath}: 顶层贡献者目录必须是 GitHub 数字 ID`);
  if (!namespaces.has(namespace)) fail(`${metadataPath}: 不支持的来源命名空间 ${namespace}`);
  if (!/^col-[a-f0-9]{24}$/.test(collection)) fail(`${metadataPath}: 收藏夹来源 ID 格式错误`);
  if (!/^doc-[a-f0-9]{24}$/.test(document)) fail(`${metadataPath}: 文档 ID 格式错误`);
  let metadata;
  try { metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8')); } catch (error) { fail(`${metadataPath}: JSON 无法解析 (${error.message})`); continue; }
  if (metadata.sourceType !== 'bilibili-video-summary') fail(`${metadataPath}: sourceType 必须是 bilibili-video-summary`);
  if (String(metadata.documentId || '') !== document) fail(`${metadataPath}: documentId 与目录不一致`);
  if (String(metadata.contributorGithubId || '') !== contributor) fail(`${metadataPath}: contributorGithubId 与目录不一致`);
  if (!/^BV[0-9A-Za-z]{10}$/i.test(String(metadata.bvid || ''))) fail(`${metadataPath}: BVID 格式错误`);
  const expectedType = namespace === 'multipart' ? 'multipart-parent' : 'single-video';
  if (metadata.documentType !== expectedType) fail(`${metadataPath}: documentType 应为 ${expectedType}`);
  const files = Array.isArray(metadata.files) ? metadata.files : [];
  if (!files.length) fail(`${metadataPath}: files 不能为空`);
  for (const item of files) {
    if (!safeRelative(item) || forbiddenNames.test(item)) { fail(`${metadataPath}: 文件路径不安全 ${item}`); continue; }
    const extension = path.extname(item).toLowerCase();
    if (!allowedExtensions.has(extension)) fail(`${metadataPath}: 不允许的文件类型 ${item}`);
    const target = path.join(path.dirname(metadataFile), item);
    if (!target.startsWith(`${path.dirname(metadataFile)}${path.sep}`) || !fs.existsSync(target) || !fs.statSync(target).isFile()) fail(`${metadataPath}: 缺少资源 ${item}`);
    if (fs.existsSync(target) && fs.statSync(target).size > 25 * 1024 * 1024) fail(`${metadataPath}: 单文件超过 25 MiB ${item}`);
  }
  const markdown = namespace === 'multipart' ? 'index.md' : 'summary.md';
  if (!files.includes(markdown)) fail(`${metadataPath}: 缺少入口 Markdown ${markdown}`);
}

for (const file of walk(root)) {
  const name = relative(file);
  if (forbiddenNames.test(name) || /\.(mp4|mkv|webm|mp3|wav|flac|sqlite|db)$/i.test(name)) fail(`禁止提交敏感或原始媒体文件：${name}`);
}

if (errors.length) {
  console.error(errors.map((item) => `- ${item}`).join('\n'));
  process.exit(1);
}
console.log(`shared document validation passed (${metadataFiles.length} document(s))`);

