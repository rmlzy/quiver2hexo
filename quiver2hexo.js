const fs = require('fs');
const shell = require('shelljs');
const rimraf = require('rimraf');
const TurndownService = require('turndown');

const toMdService = TurndownService();

// 源路径
const FROM = '/Users/go_songs/Documents/liuzhiyuan/QuiverData/github.qvnotebook';
// 模板路径
const TO = '/Users/go_songs/Documents/liuzhiyuan/blog/yuan-blog/source';

function initSource(TO) {
  const post = TO + '/_posts';
  const assets = TO + '/assets';
  shell.rm('-rf', post);
  shell.rm('-rf', assets);
  shell.mkdir(post);
  shell.mkdir(assets);
}

function ls(path) {
  const files = fs.readdirSync(path);
  return files.map(file => {
    return path + '/' + file;
  })
}

function cp(filePath, dirPath) {
  if (!hasDir(dirPath)) {
    fs.mkdirSync(dirPath);
  }
  fs.createReadStream(filePath).pipe(fs.createWriteStream(dirPath));
}

function hasDir(path) {
  return fs.existsSync(path);
}

function isDir(path) {
  if (!hasDir(path)) return false;
  return fs.lstatSync(path).isDirectory();
}

function isFile(path) {
  return fs.lstatSync(path).isFile();
}

function readJSON(path) {
  const buffer = fs.readFileSync(path);
  return JSON.parse(buffer.toString('utf8'));
}

function readNote(path) {
  const content = readJSON(path + '/content.json');
  const meta = readJSON(path + '/meta.json');
  const note = {
    uuid: meta.uuid,
    title: meta.title.replace(/:/g, ' ') || '无标题笔记',
    tags: meta.tags,
    date: meta.created_at,
    content: ''
  };

  // 解析 cells
  if (content.cells) {
    content.cells.map(function (cell) {
      if (cell.type === 'text') {
        let content = toMdService.turndown(cell.data) + '\n\n';
        note.content += content.replace(/quiver-image-url/g, '/assets');
      }
      if (cell.type === 'markdown') {
        note.content += cell.data + '\n\n';
      }
      if (cell.type === 'code') {
        note.content += '```' + cell.language + '\n' + cell.data + '\n```\n\n';
      }
    })
  }
  writeMd(note);
}

function writeMd(note) {
  const meta = `---\ntitle: ${note.title}\ndate: 2017-12-15 23:19:13\ntags: ${JSON.stringify(note.tags)}\n---\n\n`;
  fs.writeFileSync(`${TO}/_posts/${note.uuid}.md`, meta + note.content);
}

function writeRes(path) {
  const resPath = path + '/resources';
  if (isDir(resPath)) {
    const res = ls(resPath);
    if (res) {
      res.map(item => {
        shell.cp('-rf', item, TO + '/assets/');
      })
    }
  }
}

function start() {
  initSource(TO);

  ls(FROM).map(function (notePath) {
    if (isDir(notePath)) {
      readNote(notePath);
      writeRes(notePath);
    }
  });
}

start(TO);