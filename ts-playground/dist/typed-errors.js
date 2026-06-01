/**
 * E3.5 — Fix 6 deliberate TypeScript errors.
 *
 * This file is given to you as-is. Your job:
 *   1. Run `npx tsc --noEmit` and capture the full output into
 *      `e3_5_errors_before.txt`. There should be 6 errors numbered 1–6 below.
 *   2. Fix each one without changing the BEHAVIOUR of the function — only
 *      the TYPES. Leave the comment markers (// ERROR 1: ...) in place.
 *   3. Run `npx tsc --noEmit` again and capture the clean output into
 *      `e3_5_errors_after.txt`. There must be zero errors.
 *   4. Run `npx tsx src/typed-errors.ts` and confirm the script prints the
 *      expected output (see end of file).
 *
 * No `any`. No `// @ts-ignore`. Use the smallest, most specific type.
 */
// ERROR 1: the array literal has a string where a number is expected.
const products = [
    { id: 1, name: "Mouse", pricePaise: 49900, inStock: true },
    { id: 2, name: "Keyboard", pricePaise: 349900, inStock: true }, // remove " " from id = "2"
    { id: 3, name: "Monitor", pricePaise: 1899900, inStock: false },
];
// ERROR 2: the function says it returns a Product but it sometimes returns undefined.
function findById(id) {
    // added undefined via union
    return products.find((p) => p.id === id);
}
// ERROR 3: the parameter type does not allow strings, but the caller passes a string.
function formatPrice(paise) {
    return `Rs. ${(paise / 100).toFixed(2)}`;
}
console.log(formatPrice(49900)); // remove ""
// ERROR 4: filter callback's parameter type is wrong.
const inStock = products.filter((p) => p.inStock); // remove string
// ERROR 5: missing property on the object literal.
const newProduct = {
    id: 4,
    name: "Webcam",
    pricePaise: 249900,
    //inStock: false,  mark as optional with the help of ?
};
// ERROR 6: generic constraint is missing, so `T['id']` is not allowed.
function pickIds(items) {
    // we can bind the id with the help of etends keyword
    return items.map((item) => item.id);
}
console.log(pickIds(products));
export {};
/* ---------------------------------------------------------------------------
 * Expected output after fixes:
 *
 *   Rs. 499.00
 *   [ 1, 2, 3 ]
 *
 * --------------------------------------------------------------------------- */
