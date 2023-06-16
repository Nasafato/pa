export async function createFileIfNotExists(path: string) {
  try {
    await Deno.stat(path);
  } catch (err) {
    if (err.name !== "NotFound") {
      throw err;
    }
    await Deno.create(path);
  }
}
