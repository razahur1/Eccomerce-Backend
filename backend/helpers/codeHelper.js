export const generateRandomHexCode = (length) => {
  let result = "";
  const characters = "0123456789ABCDEF"; 

  for (let i = 0; i < length - 1; i++) {
    // Generate length - 1 to leave space for the last letter
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
};
