import * as fs from 'fs';

const scriptRegExp = /<script type="module" crossorigin src="(.+?)"><\/script>/;
const styleRegExp = /<link rel="stylesheet" href="(.+?)">/;

fs.writeFileSync(
  './dist/index .html',
  fs
    .readFileSync('./dist/index.html', 'utf8')
    .replace(
      scriptRegExp,
      (match, path) =>
        `<script>
  document.addEventListener("DOMContentLoaded", function(event) {
    ${fs.readFileSync(`./dist${path}`, 'utf8')}
  });
</script>`,
    )
    .replace(
      styleRegExp,
      (match, path) =>
        `<style>${fs.readFileSync(`./dist${path}`, 'utf8')}</style>`,
    ),
  'utf8',
);
