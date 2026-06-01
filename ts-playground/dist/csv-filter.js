/**
 * E3.4 — Typed CSV reader.
 *
 * Reads employees.csv, parses each row into a typed object, keeps only
 * rows where JOB_ID is 'IT_PROG', and writes them to output.txt.
 *
 * What you must do:
 *  1. Read this file end-to-end. Understand each line.
 *  2. Download employees.csv from the Documents Reference Drive folder and
 *     put it next to this file.
 *  3. Run with: npx tsx src/csv-filter.ts
 *  4. Confirm output.txt is created and contains only IT_PROG rows.
 *
 * What you must NOT do: change the EmployeeRow interface or the function
 * signatures — those define the shape the reviewer will check.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
const INPUT = path.resolve("src", "employees.csv");
const OUTPUT = path.resolve("src", "output.txt");
async function main() {
    const raw = await readFile(INPUT, "utf8");
    const lines = raw.split(/\r?\n/).filter((l) => l.length > 0);
    const header = lines[0].split(",");
    const rows = lines.slice(1).map((line) => {
        const cols = line.split(",");
        const row = {};
        header.forEach((h, i) => {
            row[h] = cols[i] ?? "";
        });
        return row;
    });
    const itProg = rows.filter((r) => r.JOB_ID === "IT_PROG");
    // Write back as CSV (header + filtered rows).
    const out = [
        header.join(","),
        ...itProg.map((r) => header.map((h) => r[h] ?? "").join(",")),
    ].join("\n");
    await writeFile(OUTPUT, out, "utf8");
    console.log(`Wrote ${itProg.length} rows to ${OUTPUT}`);
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
