/**
 * Seam for S3-compatible export of clips/images. Not wired in v1.
 */
export type ExportObject = {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType: string;
};

export async function putExportObject(_object: ExportObject): Promise<{ url: string } | null> {
  return null;
}
