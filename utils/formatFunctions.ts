export function formatDecimal(number: string) {
  let newNumber; let firstPart; let secondPart; let
    thirdPart;
  if (number.length <= 3) return number;
  if (number.length === 7) {
    firstPart = number.slice(0, number.length - 6);
    secondPart = number.slice(1, number.length - 3);
    thirdPart = number.slice(-3);
    newNumber = `${firstPart}.${secondPart}.${thirdPart}`;
    return newNumber;
  }
  if (number.length === 8) {
    firstPart = number.slice(0, number.length - 6);
    secondPart = number.slice(2, number.length - 3);
    thirdPart = number.slice(-3);
    newNumber = `${firstPart}.${secondPart}.${thirdPart}`;
    return newNumber;
  }
  firstPart = number.slice(0, number.length - 3);
  secondPart = number.slice(-3);
  newNumber = `${firstPart}.${secondPart}`;
  return newNumber;
}

export function format(number: number) {
  if (number.toString().length === 1) {
    const newNumber = (`00${number}`).slice(-2);
    return newNumber;
  }

  return number;
}
