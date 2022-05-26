export const isDni = (input) => {
  // verificar si es un numero
  if (Number(input) === "NaN") return false;
  // verificar que contenga 8 caracteres
  if (input.length !== 8) return false;

  return true;
};
