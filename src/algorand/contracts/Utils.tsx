import { algodClient } from '../utils/Utils';
import { CompileOut } from 'algosdk';

const { Buffer } = require("buffer");

/**
 * Helper function to compile program source
 * @function
 * @param {string} programSource - The source code of the file
 * @returns {Uint8Array} The program compiled
 */
export async function compileProgram(programSource: string) {
  const enc = new TextEncoder();
  const programBytes: Uint8Array = enc.encode(programSource);
  const compileResponse: CompileOut = await algodClient.compile(programBytes).do();
  const compiledBytes: Uint8Array = new Uint8Array(Buffer.from(compileResponse.result, "base64"));
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
 * encodeUint64 converts an integer to its binary representation.
 * @param {number | bigint} num The number to convert. This must be an unsigned integer less than
 *   2^64.
 * @returns {Uint8Array} An 8-byte typed array containing the big-endian encoding of the input
 *   integer.
 */
export function encodeUint64(num: number | bigint) {
  const isInteger = typeof num === 'bigint' || Number.isInteger(num);

  // @ts-ignore
  if (!isInteger || num < 0 || num > 0xFFFFFFFFFFFFFFFFn) {
    throw new Error('Input is not a 64-bit unsigned integer');
  }

  const buf = Buffer.allocUnsafe(8);

  buf.writeBigUInt64BE(BigInt(num));

  return new Uint8Array(buf);
}

/**
 * decodeUint64 produces an integer from a binary representation.
 * @param {Uint8Array} data An typed array containing the big-endian encoding of an unsigned integer
 *   less than 2^64. This array must be at most 8 bytes long.
 * @param {"safe" | "mixed" | "bigint"} decodingMode Configure how the integer will be
 *   decoded.
 *
 *   The options are:
 *   * "safe": The integer will be decoded as a Number, but if it is greater than
 *     Number.MAX_SAFE_INTEGER an error will be thrown.
 *   * "mixed": The integer will be decoded as a Number if it is less than or equal to
 *     Number.MAX_SAFE_INTEGER, otherwise it will be decoded as a BigInt.
 *   * "bigint": The integer will always be decoded as a BigInt.
 *
 *   Defaults to "safe" if not included.
 * @returns {number | bigint} The integer that was encoded in the input data. The return type will
 *   be determined by the parameter decodingMode.
 */
export function decodeUint64(data: Uint8Array, decodingMode: string ='safe') {
  if (decodingMode !== 'safe' && decodingMode !== 'mixed' && decodingMode !== 'bigint') {
    throw new Error('Unknown decodingMode option: ' + decodingMode);
  }

  if (data.byteLength === 0 || data.byteLength > 8) {
    throw new Error('Data has unacceptable length. Expected length is between 1 and 8, got ' + data.byteLength);
  }

  // insert 0s at the beginning if data is smaller than 8 bytes
  const padding = Buffer.allocUnsafe(8 - data.byteLength);
  padding.fill(0);

  const buf = Buffer.concat([padding, Buffer.from(data)]);

  const num = buf.readBigUInt64BE();
  const isBig = num > Number.MAX_SAFE_INTEGER;

  if (decodingMode === 'safe') {
    if (isBig) {
      throw new Error('Integer exceeds maximum safe integer: ' + num.toString() + '. Try decoding with "mixed" or "safe" decodingMode.');
    }
    return Number(num);
  }

  if (decodingMode === 'mixed' && !isBig) {
    return Number(num);
  }

  return num;
}

/**
 * Converts number to Uint8Array
 * @function
 * @param {string} str - String to be converted
 * @returns {Uint8Array} The string as a Uint8Array
 */
export function stringToUint64(str: string): Uint8Array {
  const enc = new TextEncoder(); // always utf-8
  return enc.encode(str);
}