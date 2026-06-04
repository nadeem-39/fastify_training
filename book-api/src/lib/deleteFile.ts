import fs from "node:fs/promises";
import path from "node:path";

export const deleteFile = async (bookPath: string): Promise<void> => {
  try {
    const absolutePath = path.join(process.cwd(), `${bookPath}`);

    await fs.unlink(absolutePath);
  } catch (error: any) {
    // Ignore if file doesn't exist
    console.log(error);
  }
};
