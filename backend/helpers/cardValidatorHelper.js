import validator from "card-validator";

export const validateCardDetails = (cardDetails) => {
  const errors = [];

  // Validate card number and get card type
  const cardNumberValidation = validator.number(cardDetails.cardNumber);
  if (!cardNumberValidation.isValid) {
    errors.push("Invalid card number.");
  }

  // Get the card type (e.g., Visa, MasterCard)
  const cardType = cardNumberValidation.card
    ? cardNumberValidation.card.type
    : null;

  // Check if card type is either Visa or MasterCard
  if (cardType !== "visa" && cardType !== "mastercard") {
    errors.push("Card type must be either Visa or MasterCard.");
  }

  // Validate expiry date
  const expiryDateValidation = validator.expirationDate(cardDetails.expiryDate);
  if (!expiryDateValidation.isValid) {
    errors.push("Invalid expiry date.");
  }

  // Validate CVV
  const cvvValidation = validator.cvv(cardDetails.cvv);
  if (!cvvValidation.isValid) {
    errors.push("Invalid CVV number.");
  }

  // Return validation result
  return {
    isValid: errors.length === 0,
    cardType,
    errors,
  };
};
