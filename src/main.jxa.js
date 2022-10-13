#!/usr/bin/env osascript -l JavaScript

function run(argv) {
  const App = Application.currentApplication();
  App.includeStandardAdditions = true;

  const HOME = App.systemAttribute('HOME');

  const downloads = App.doShellScript(
    `mdls ${HOME}/Downloads/*.* -name kMDItemFSName -name kMDItemDateAdded`,
  )
    .replace(/((^[^\=]+\=\s))/gm, '')
    .split(/\r/)
    .reduce(
      (acc, cur, i) =>
        i % 2 === 0
          ? [...acc, { ts: parseInt(cur.replace(/[^\d]/g, '')) }]
          : ((add = acc.pop()),
            [...acc, Object.assign(add, { name: eval(cur) })]),
      [],
    )
    .sort(({ ts: a }, { ts: b }) => a - b)
    .reverse()
    .map(({ name }) => name);

  const baseSubtitle = (
    op = 'move',
    detail = 'recent files up to this file',
    dest = 'into the current Finder location',
  ) => `Press return to ${op} ${detail} ${dest}.`;

  return JSON.stringify({
    items: downloads.map((filename, i) => ({
      title: `${i} — ${filename}`,
      subtitle: baseSubtitle(),
      arg: JSON.stringify({ op: 'move', files: downloads.slice(0, i + 1) }),
      icon: {
        path: `${HOME}/Downloads/${filename}`,
        type: 'fileicon',
      },
      match: `${i}`,
      valid: true,
      quicklookurl: `${HOME}/Downloads/${filename}`,

      mods: {
        /** default : move multiple**/

        // move singular
        cmd: {
          valid: true,
          arg: JSON.stringify({ op: 'move', files: [filename] }),
          subtitle: baseSubtitle('move', 'only this file'),
        },
        // copy multiple
        alt: {
          valid: true,
          arg: JSON.stringify({ op: 'copy', files: downloads.slice(0, i + 1) }),
          subtitle: baseSubtitle('copy'),
        },
        // copy singular
        'alt+cmd': {
          valid: true,
          arg: JSON.stringify({ op: 'copy', files: [filename] }),
          subtitle: baseSubtitle('copy', 'only this file'),
        },
        // pasteboard multiple
        shift: {
          valid: true,
          arg: JSON.stringify({
            op: 'pasteboard',
            files: downloads.slice(0, i + 1),
          }),
          subtitle: baseSubtitle(
            'send',
            'recent files up to this file',
            'to the pasteboard',
          ),
        },
        // pasteboard singular
        'cmd+shift': {
          valid: true,
          arg: JSON.stringify({ op: 'pasteboard', files: [filename] }),
          subtitle: baseSubtitle('send', 'only this file', 'to the pasteboard'),
        },
      },
    })),
  });
}
