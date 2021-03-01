/**
 * Helper function to compile program source
 * @function
 * @param {any} client -
 * @param {string} programSource - The source code of the file
 * @returns {Uint8Array} The program compiled
 */
export async function compileProgram(client: any, programSource: string) {
  let encoder = new TextEncoder();
  let programBytes = encoder.encode(programSource);
  let compileResponse = await client.compile(programBytes).do();
  let compiledBytes = new Uint8Array(Buffer.from(compileResponse.result, "base64"));
  return compiledBytes;
}

/**
 * Loads file from url
 * @function
 * @param {string} url - Url of the file
 * @returns {string | null} The file content or null if cannot get file
 */
export function loadFile(url: string): string | null {
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", url, false);
  xmlhttp.send();
  if (xmlhttp.status === 200) result = xmlhttp.responseText;
  return result;
}

/**
 * Converts number to Uint8Array
 * @function
 * @param {number} number - Number to be converted
 * @returns {Uint8Array} The number as a Uint8Array
 */
export function numberToUint8Array(number: number): Uint8Array {
  let hex = BigInt(number).toString(16);
  if (hex.length % 2) { hex = '0' + hex; }

  let len = hex.length / 2;
  let u8 = new Uint8Array(len);

  let i = 0;
  let j = 0;
  while (i < len) {
    u8[i] = parseInt(hex.slice(j, j+2), 16);
    i += 1;
    j += 2;
  }

  return u8;
}