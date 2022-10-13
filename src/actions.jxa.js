#!/usr/bin/env osascript -l JavaScript

function run([argv]) {
  const { op, files } = JSON.parse(argv);

  const App = Application.currentApplication();
  App.includeStandardAdditions = true;

  const DOWNLOADS = `${App.systemAttribute('HOME')}/Downloads`;

  const FinderPath = () =>
    decodeURI(
      Application('Finder')
        .insertionLocation()
        .url()
        .replace(/^file:\/\//, ''),
    );

  const ACTIONS = {
    pasteboard: (files) => {
      ObjC.import('AppKit');
      const pasteboard = $.NSPasteboard.generalPasteboard;
      pasteboard.clearContents;
      []
        .concat(files)
        .forEach((f) =>
          pasteboard.writeObjects([
            ObjC.unwrap($.NSURL.fileURLWithPath(`${DOWNLOADS}/${f}`)),
          ]),
        );
    },
    move: (files) =>
      files.forEach((file) =>
        App.doShellScript(`mv "${DOWNLOADS}/${file}" "${FinderPath()}"`),
      ),
    copy: (files) =>
      files.forEach((file) =>
        App.doShellScript(`cp "${DOWNLOADS}/${file}" "${FinderPath()}"`),
      ),
  };

  ACTIONS[op](files);

  App.doShellScript(`afplay /System/Library/Sounds/Funk.aiff`);
}
