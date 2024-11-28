function parseFileName(name) {
  const nameArray = name.split('.');
  if (nameArray.length > 1) {
    const extension = `.${nameArray[nameArray.length - 1]}`;
    const baseName = nameArray.slice(0, -1).join('.');
    const firstLetter = baseName[0];
    const lastLetter = baseName[baseName.length - 1];
    const middleText = baseName.slice(1, -1);
    return {
      baseName,
      firstLetter,
      lastLetter,
      middleText,
      extension
    };
  }
  const firstLetter = name[0];
  const lastLetter = name[name.length - 1];
  const middleText = name.slice(1, -1);
  return {
    baseName: name,
    firstLetter,
    lastLetter,
    middleText
  };
}

export default parseFileName;
