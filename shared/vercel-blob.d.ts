declare module "@vercel/blob" {
  interface PutOptions {
    access?: "public" | "private";
    token?: string;
    contentType?: string;
  }

  export function put(
    key: string,
    body: ArrayBuffer | SharedArrayBuffer | Uint8Array | string,
    options?: PutOptions
  ): Promise<{ url: string }>;
}
