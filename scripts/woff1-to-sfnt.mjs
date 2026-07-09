import zlib from "node:zlib";

/** WOFF v1 → SFNT（TTF/OTF）解压，供 cn-font-split 使用 */
export function woff1ToSfnt(buf) {
  const input = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  const view = new DataView(input.buffer, input.byteOffset, input.byteLength);
  const magic = input.toString("ascii", 0, 4);
  if (magic !== "wOFF") {
    throw new Error(`Expected WOFF v1 (wOFF), got "${magic}"`);
  }

  const flavor = view.getUint32(4, false);
  const numTables = view.getUint16(12, false);

  const entries = [];
  let pos = 44;
  for (let i = 0; i < numTables; i++) {
    entries.push({
      tag: input.toString("ascii", pos, pos + 4),
      offset: view.getUint32(pos + 4, false),
      compLength: view.getUint32(pos + 8, false),
      origLength: view.getUint32(pos + 12, false),
      checksum: view.getUint32(pos + 16, false),
    });
    pos += 20;
  }

  const tableData = entries.map((entry) => {
    const slice = input.subarray(entry.offset, entry.offset + entry.compLength);
    if (entry.compLength === entry.origLength) {
      return Buffer.from(slice);
    }
    return zlib.inflateSync(slice);
  });

  const headerSize = 12 + entries.length * 16;
  let tableOffset = headerSize;
  const paddedTables = tableData.map((data) => {
    const pad = (4 - (data.length % 4)) % 4;
    const padded = Buffer.alloc(data.length + pad);
    data.copy(padded);
    const offset = tableOffset;
    tableOffset += padded.length;
    return { data: padded, offset };
  });

  const out = Buffer.alloc(tableOffset);
  const outView = new DataView(out.buffer);

  outView.setUint32(0, flavor, false);
  outView.setUint16(4, numTables, false);
  const maxPow2 = numTables > 0 ? Math.floor(Math.log2(numTables)) : 0;
  const searchRange = (1 << maxPow2) * 16;
  outView.setUint16(6, searchRange, false);
  outView.setUint16(8, maxPow2, false);
  outView.setUint16(10, numTables * 16 - searchRange, false);

  entries.forEach((entry, i) => {
    const recOff = 12 + i * 16;
    out.write(entry.tag, recOff, 4, "ascii");
    outView.setUint32(recOff + 4, entry.checksum, false);
    outView.setUint32(recOff + 8, paddedTables[i].offset, false);
    outView.setUint32(recOff + 12, entry.origLength, false);
  });

  paddedTables.forEach(({ data, offset }) => {
    data.copy(out, offset);
  });

  return new Uint8Array(out);
}
