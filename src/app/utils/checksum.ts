/*
 * This algorithm, for checking NUS Student ID validity,
 * is based on http://interrobeng.com/2014/01/19/nus-matriculation-number-check-digit-algorithm/
 */

const remainderMap: string[] = new Array(
  "Y",
  "X",
  "W",
  "U",
  "R",
  "N",
  "M",
  "L",
  "J",
  "H",
  "E",
  "A",
  "B"
);
const weights: number[] = new Array(1, 1, 1, 1, 1, 1, 1);
const regex: RegExp = /^A\d{7}[A-Z]$/;

export function isValidStudentId(studentId: string): boolean {
  // checks if student ID is in the correct format
  // (1) starts with A, (2) has 7 digits, and (3) ends with a letter
  if (!regex.test(studentId)) {
    return false;
  }

  // check if last letter matches calculated letter
  // i.e. is it a valid student ID?
  const digits = studentId.slice(1, 8);
  const lastLetter = studentId.charAt(8);

  const weightedSum = digits
    .split("")
    .reduce((sum, digit, index) => sum + Number(digit) * weights[index], 0);
  const correctLastLetter = remainderMap[weightedSum % 13];

  return lastLetter === correctLastLetter;
}
