import CodeMirror from 'codemirror';
import parseCode from './parseCode';

const scopeMap = require('./finalScopeMap.json');

export default function contextAwareHinter(cm, options = {}) {
  const { hinter } = options;
  if (!hinter || typeof hinter.search !== 'function') {
    console.warn('Hinter is not available or invalid.');
    return { list: [], from: cm.getCursor(), to: cm.getCursor() };
  }

  const { line, ch } = cm.getCursor(); // getCursor has line, ch, sticky
  console.log('cm.getcursor ', cm.getCursor());
  const { start, end, string } = cm.getTokenAt({ line, ch });
  //   console.log('cm.gettokenat', cm.getTokenAt());
  const currentWord = string.trim();
  console.log('currentwork ', currentWord);

  const context = parseCode(cm); // e.g. 'draw'
  const allHints = hinter.search(currentWord); // <- from options, not cm.hinter
  const whitelist = scopeMap[context]?.whitelist || [];
  const blacklist = scopeMap[context]?.blacklist || [];
  console.log('allhints: ', allHints);

  //   for each hint, only keep ones that match the typed prefix
  const filteredHints = allHints
    .filter(
      (h) =>
        h &&
        h.item &&
        typeof h.item.text === 'string' &&
        h.item.text.startsWith(currentWord)
    )
    .map((h) => {
      const name = h.item.text;
      const isWhitelisted = whitelist.includes(name);
      const isBlacklisted = blacklist.includes(name);

      const from = CodeMirror.Pos(line, start);
      const to = CodeMirror.Pos(line, end);

      let className = '';
      if (isBlacklisted) {
        className = 'blacklisted-hint';
      } else if (isWhitelisted) {
        className = 'whitelisted-hint';
      }

      return {
        text: name, // Ensure `text` is explicitly defined
        displayText: h.item.displayText || name,
        className,
        from,
        to,
        render: (el, self, data) => {
          el.innerText = data.text;
          if (isBlacklisted) {
            el.style.color = 'red';
            el.style.opacity = 0.6;
          } else if (isWhitelisted) {
            el.style.fontWeight = 'bold';
          }
        },
        hint: (editor, data, completion) => {
          const { from: fromPos, to: toPos } = completion;

          if (!completion.text || typeof completion.text !== 'string') {
            console.error('Invalid completion.text:', completion);
            return;
          }

          editor.replaceRange(completion.text, fromPos, toPos);

          if (blacklist.includes(completion.text)) {
            console.warn(
              `Using "${completion.text}" inside "${context}" is not recommended.`
            );
          }
        }
      };
    });

  console.log('filtered hints: ', filteredHints);

  const sorted = filteredHints.sort((a, b) => {
    const score = (name) => {
      if (whitelist.includes(name)) return 0;
      if (blacklist.includes(name)) return 2;
      return 1;
    };
    return score(a.text) - score(b.text) || a.text.localeCompare(b.text);
  });

  return {
    list: sorted,
    from: CodeMirror.Pos(line, start),
    to: CodeMirror.Pos(line, end)
  };
}
