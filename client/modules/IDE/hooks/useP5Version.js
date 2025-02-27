import { useMemo } from 'react';
import { useSelector } from 'react-redux';

// Generated from https://www.npmjs.com/package/p5?activeTab=versions
// Run this in the console:
// JSON.stringify([...document.querySelectorAll('._132722c7')].map(n => n.innerText), null, 2)
// TODO: use their API for this to grab these at build time?
export const p5Versions = [
  '1.11.3',
  '2.0.0-beta.2',
  '1.11.2',
  '1.11.1',
  '1.11.0',
  '1.10.0',
  '1.9.4',
  '1.9.3',
  '1.9.2',
  '1.9.1',
  '1.9.0',
  '1.8.0',
  '1.7.0',
  '1.6.0',
  '1.5.0',
  '1.4.2',
  '1.4.1',
  '1.4.0',
  '1.3.1',
  '1.3.0',
  '1.2.0',
  '1.1.9',
  '1.1.8',
  '1.1.7',
  '1.1.5',
  '1.1.4',
  '1.1.3',
  '1.1.2',
  '1.1.1',
  '1.1.0',
  '1.0.0',
  '0.10.2',
  '0.10.1',
  '0.10.0',
  '0.9.0',
  '0.8.0',
  '0.7.3',
  '0.7.2',
  '0.7.1',
  '0.7.0',
  '0.6.1',
  '0.6.0',
  '0.5.16',
  '0.5.15',
  '0.5.14',
  '0.5.13',
  '0.5.12',
  '0.5.11',
  '0.5.10',
  '0.5.9',
  '0.5.8',
  '0.5.7',
  '0.5.6',
  '0.5.5',
  '0.5.4',
  '0.5.3',
  '0.5.2',
  '0.5.1',
  '0.5.0',
  '0.4.24',
  '0.4.23',
  '0.4.22',
  '0.4.21',
  '0.4.20',
  '0.4.19',
  '0.4.18',
  '0.4.17',
  '0.4.16',
  '0.4.15',
  '0.4.14',
  '0.4.13',
  '0.4.12',
  '0.4.11',
  '0.4.10',
  '0.4.9',
  '0.4.8',
  '0.4.7',
  '0.4.6',
  '0.4.5',
  '0.4.4',
  '0.4.3',
  '0.4.2',
  '0.4.1',
  '0.4.0',
  '0.3.16',
  '0.3.15',
  '0.3.14',
  '0.3.13',
  '0.3.12',
  '0.3.11',
  '0.3.10',
  '0.3.9',
  '0.3.8',
  '0.3.7',
  '0.3.6',
  '0.3.5',
  '0.3.4',
  '0.3.3',
  '0.3.2',
  '0.3.1',
  '0.3.0',
  '0.2.23',
  '0.2.22',
  '0.2.21',
  '0.2.20',
  '0.2.19',
  '0.2.18',
  '0.2.17',
  '0.2.16',
  '0.2.15',
  '0.2.14',
  '0.2.13',
  '0.2.12',
  '0.2.11',
  '0.2.10',
  '0.2.9',
  '0.2.8',
  '0.2.7',
  '0.2.6',
  '0.2.5',
  '0.2.4',
  '0.2.3',
  '0.2.2',
  '0.2.1'
];

export const p5SoundURL =
  'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.1/addons/p5.sound.min.js';
export const p5PreloadAddonURL = 'https://TODO/preload.js';
export const p5ShapesAddonURL = 'https://TODO/shapes.js';

export function useP5Version() {
  const files = useSelector((state) => state.files);
  const indexFile = files.find(
    (file) =>
      file.fileType === 'file' &&
      file.name === 'index.html' &&
      file.filePath === ''
  );
  const indexSrc = indexFile?.content;
  const indexID = indexFile?.id;

  // { version: string, minified: boolean, replaceVersion: (version: string) => string } | null
  const versionInfo = useMemo(() => {
    if (!indexSrc) return null;
    const dom = new DOMParser().parseFromString(indexSrc, 'text/html');

    const serializeResult = () => {
      let src = dom.documentElement.outerHTML;

      if (dom.doctype) {
        const doctype = new XMLSerializer().serializeToString(dom.doctype);
        src = `${doctype}\n${src}`;
      }

      console.log(src);
      return src;
    };

    const usedP5Versions = [...dom.documentElement.querySelectorAll('script')]
      .map((scriptNode) => {
        const src = scriptNode.getAttribute('src') || '';
        const matches = [
          /^https?:\/\/cdnjs.cloudflare.com\/ajax\/libs\/p5.js\/(.+)\/p5\.(?:min\.)?js$/,
          /^https?:\/\/cdn.jsdelivr.net\/npm\/p5@(.+)\/lib\/p5\.(min\.)?js$/
        ].map((regex) => regex.exec(src));
        const match = matches.find((m) => m); // Find first that matched
        if (!match) return null;

        // See if this is a version we recognize
        if (p5Versions.includes(match[1])) {
          return { version: match[1], minified: !!match[2], scriptNode };
        }
        return null;
      })
      .filter((version) => version !== null);

    // We only know for certain which one we've got if
    if (usedP5Versions.length === 1) {
      const { version, minified, scriptNode } = usedP5Versions[0];
      const replaceVersion = function (newVersion) {
        const file = minified ? 'p5.min.js' : 'p5.js';
        scriptNode.setAttribute(
          'src',
          `https://cdnjs.cloudflare.com/ajax/libs/p5.js/${newVersion}/${file}`
        );
        return serializeResult();
      };

      const p5SoundNode = [
        ...dom.documentElement.querySelectorAll('script')
      ].find((s) => s.getAttribute('src') === p5SoundURL);
      const setP5Sound = function (enabled) {
        if (!enabled && p5SoundNode) {
          p5SoundNode.parentNode.removeChild(p5SoundNode);
        } else if (enabled && !p5SoundNode) {
          const newNode = document.createElement('script');
          newNode.setAttribute('src', p5SoundURL);
          scriptNode.parentNode.insertBefore(newNode, scriptNode.nextSibling);
        }
        return serializeResult();
      };

      const p5PreloadAddonNode = [
        ...dom.documentElement.querySelectorAll('script')
      ].find((s) => s.getAttribute('src') === p5PreloadAddonURL);
      const setP5PreloadAddon = function (enabled) {
        if (!enabled && p5PreloadAddonNode) {
          p5PreloadAddonNode.parentNode.removeChild(p5PreloadAddonNode);
        } else if (enabled && !p5PreloadAddonNode) {
          const newNode = document.createElement('script');
          newNode.setAttribute('src', p5PreloadAddonURL);
          scriptNode.parentNode.insertBefore(newNode, scriptNode.nextSibling);
        }
        return serializeResult();
      };

      const p5ShapesAddonNode = [
        ...dom.documentElement.querySelectorAll('script')
      ].find((s) => s.getAttribute('src') === p5ShapesAddonURL);
      const setP5ShapesAddon = function (enabled) {
        if (!enabled && p5ShapesAddonNode) {
          p5ShapesAddonNode.parentNode.removeChild(p5ShapesAddonNode);
        } else if (enabled && !p5ShapesAddonNode) {
          const newNode = document.createElement('script');
          newNode.setAttribute('src', p5ShapesAddonURL);
          scriptNode.parentNode.insertBefore(newNode, scriptNode.nextSibling);
        }
        return serializeResult();
      };

      return {
        version,
        minified,
        replaceVersion,
        p5Sound: !!p5SoundNode,
        setP5Sound,
        p5PreloadAddon: !!p5PreloadAddonNode,
        setP5PreloadAddon,
        p5ShapesAdddon: !!p5ShapesAddonNode,
        setP5ShapesAddon
      };
    }
    return null;
  }, [indexSrc]);

  return { indexID, versionInfo };
}
