function md5(input: string): string {
  const utf8 = unescape(encodeURIComponent(input));

  const rotateLeft = (value: number, shift: number) => (value << shift) | (value >>> (32 - shift));

  const addUnsigned = (x: number, y: number) => {
    const x8 = x & 0x80000000;
    const y8 = y & 0x80000000;
    const x4 = x & 0x40000000;
    const y4 = y & 0x40000000;
    const result = (x & 0x3fffffff) + (y & 0x3fffffff);
    if (x4 & y4) {
      return result ^ 0x80000000 ^ x8 ^ y8;
    }
    if (x4 | y4) {
      if (result & 0x40000000) {
        return result ^ 0xc0000000 ^ x8 ^ y8;
      }
      return result ^ 0x40000000 ^ x8 ^ y8;
    }
    return result ^ x8 ^ y8;
  };

  const f = (x: number, y: number, z: number) => (x & y) | (~x & z);
  const g = (x: number, y: number, z: number) => (x & z) | (y & ~z);
  const h = (x: number, y: number, z: number) => x ^ y ^ z;
  const i = (x: number, y: number, z: number) => y ^ (x | ~z);

  const ff = (
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ) => addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, f(b, c, d)), addUnsigned(x, ac)), s), b);

  const gg = (
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ) => addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, g(b, c, d)), addUnsigned(x, ac)), s), b);

  const hh = (
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ) => addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, h(b, c, d)), addUnsigned(x, ac)), s), b);

  const ii = (
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ) => addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, i(b, c, d)), addUnsigned(x, ac)), s), b);

  const convertToWordArray = (str: string) => {
    const wordCount = (((str.length + 8) >>> 6) + 1) * 16;
    const words = Array<number>(wordCount).fill(0);
    for (let index = 0; index < str.length; index++) {
      words[index >> 2] |= str.charCodeAt(index) << ((index % 4) * 8);
    }
    words[str.length >> 2] |= 0x80 << ((str.length % 4) * 8);
    words[wordCount - 2] = str.length * 8;
    return words;
  };

  const wordsToHex = (value: number) => {
    let result = '';
    for (let index = 0; index <= 3; index++) {
      result += ((value >> (index * 8)) & 255).toString(16).padStart(2, '0');
    }
    return result;
  };

  const x = convertToWordArray(utf8);
  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let k = 0; k < x.length; k += 16) {
    const aa = a;
    const bb = b;
    const cc = c;
    const dd = d;

    a = ff(a, b, c, d, x[k], 7, -680876936);
    d = ff(d, a, b, c, x[k + 1], 12, -389564586);
    c = ff(c, d, a, b, x[k + 2], 17, 606105819);
    b = ff(b, c, d, a, x[k + 3], 22, -1044525330);
    a = ff(a, b, c, d, x[k + 4], 7, -176418897);
    d = ff(d, a, b, c, x[k + 5], 12, 1200080426);
    c = ff(c, d, a, b, x[k + 6], 17, -1473231341);
    b = ff(b, c, d, a, x[k + 7], 22, -45705983);
    a = ff(a, b, c, d, x[k + 8], 7, 1770035416);
    d = ff(d, a, b, c, x[k + 9], 12, -1958414417);
    c = ff(c, d, a, b, x[k + 10], 17, -42063);
    b = ff(b, c, d, a, x[k + 11], 22, -1990404162);
    a = ff(a, b, c, d, x[k + 12], 7, 1804603682);
    d = ff(d, a, b, c, x[k + 13], 12, -40341101);
    c = ff(c, d, a, b, x[k + 14], 17, -1502002290);
    b = ff(b, c, d, a, x[k + 15], 22, 1236535329);

    a = gg(a, b, c, d, x[k + 1], 5, -165796510);
    d = gg(d, a, b, c, x[k + 6], 9, -1069501632);
    c = gg(c, d, a, b, x[k + 11], 14, 643717713);
    b = gg(b, c, d, a, x[k], 20, -373897302);
    a = gg(a, b, c, d, x[k + 5], 5, -701558691);
    d = gg(d, a, b, c, x[k + 10], 9, 38016083);
    c = gg(c, d, a, b, x[k + 15], 14, -660478335);
    b = gg(b, c, d, a, x[k + 4], 20, -405537848);
    a = gg(a, b, c, d, x[k + 9], 5, 568446438);
    d = gg(d, a, b, c, x[k + 14], 9, -1019803690);
    c = gg(c, d, a, b, x[k + 3], 14, -187363961);
    b = gg(b, c, d, a, x[k + 8], 20, 1163531501);
    a = gg(a, b, c, d, x[k + 13], 5, -1444681467);
    d = gg(d, a, b, c, x[k + 2], 9, -51403784);
    c = gg(c, d, a, b, x[k + 7], 14, 1735328473);
    b = gg(b, c, d, a, x[k + 12], 20, -1926607734);

    a = hh(a, b, c, d, x[k + 5], 4, -378558);
    d = hh(d, a, b, c, x[k + 8], 11, -2022574463);
    c = hh(c, d, a, b, x[k + 11], 16, 1839030562);
    b = hh(b, c, d, a, x[k + 14], 23, -35309556);
    a = hh(a, b, c, d, x[k + 1], 4, -1530992060);
    d = hh(d, a, b, c, x[k + 4], 11, 1272893353);
    c = hh(c, d, a, b, x[k + 7], 16, -155497632);
    b = hh(b, c, d, a, x[k + 10], 23, -1094730640);
    a = hh(a, b, c, d, x[k + 13], 4, 681279174);
    d = hh(d, a, b, c, x[k], 11, -358537222);
    c = hh(c, d, a, b, x[k + 3], 16, -722521979);
    b = hh(b, c, d, a, x[k + 6], 23, 76029189);
    a = hh(a, b, c, d, x[k + 9], 4, -640364487);
    d = hh(d, a, b, c, x[k + 12], 11, -421815835);
    c = hh(c, d, a, b, x[k + 15], 16, 530742520);
    b = hh(b, c, d, a, x[k + 2], 23, -995338651);

    a = ii(a, b, c, d, x[k], 6, -198630844);
    d = ii(d, a, b, c, x[k + 7], 10, 1126891415);
    c = ii(c, d, a, b, x[k + 14], 15, -1416354905);
    b = ii(b, c, d, a, x[k + 5], 21, -57434055);
    a = ii(a, b, c, d, x[k + 12], 6, 1700485571);
    d = ii(d, a, b, c, x[k + 3], 10, -1894986606);
    c = ii(c, d, a, b, x[k + 10], 15, -1051523);
    b = ii(b, c, d, a, x[k + 1], 21, -2054922799);
    a = ii(a, b, c, d, x[k + 8], 6, 1873313359);
    d = ii(d, a, b, c, x[k + 15], 10, -30611744);
    c = ii(c, d, a, b, x[k + 6], 15, -1560198380);
    b = ii(b, c, d, a, x[k + 13], 21, 1309151649);
    a = ii(a, b, c, d, x[k + 4], 6, -145523070);
    d = ii(d, a, b, c, x[k + 11], 10, -1120210379);
    c = ii(c, d, a, b, x[k + 2], 15, 718787259);
    b = ii(b, c, d, a, x[k + 9], 21, -343485551);

    a = addUnsigned(a, aa);
    b = addUnsigned(b, bb);
    c = addUnsigned(c, cc);
    d = addUnsigned(d, dd);
  }

  return wordsToHex(a) + wordsToHex(b) + wordsToHex(c) + wordsToHex(d);
}

export function getGravatarUrl(email: string | undefined | null, size = 48): string {
  const normalized = email?.trim().toLowerCase() ?? '';
  if (!normalized) {
    return `https://www.gravatar.com/avatar/?d=identicon&s=${size}`;
  }
  return `https://www.gravatar.com/avatar/${md5(normalized)}?d=identicon&s=${size}`;
}
