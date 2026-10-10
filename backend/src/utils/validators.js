// helper validation functions

function validateName(name, fieldName = 'Name') {
  if (!name || typeof name !== 'string') {
    return `${fieldName} is required.`;
  }
  const trimmed = name.trim();
  if (trimmed.length < 20 || trimmed.length > 60) {
    return `${fieldName} must be between 20 and 60 characters.`;
  }
  return null;
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return 'Email is required.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address.';
  }
  return null;
}

function validateAddress(address, fieldName = 'Address') {
  if (!address || typeof address !== 'string' || address.trim() === '') {
    return `${fieldName} is required.`;
  }
  if (address.trim().length > 400) {
    return `${fieldName} cannot exceed 400 characters.`;
  }
  return null;
}

function validatePassword(password, fieldName = 'Password') {
  if (!password || typeof password !== 'string') {
    return `${fieldName} is required.`;
  }
  if (password.length < 8 || password.length > 16) {
    return `${fieldName} must be between 8 and 16 characters.`;
  }
  if (!/[A-Z]/.test(password)) {
    return `${fieldName} must contain at least one uppercase letter.`;
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    return `${fieldName} must contain at least one special character.`;
  }
  return null;
}

function validateRating(rating) {
  const num = Number(rating);
  if (!Number.isInteger(num) || num < 1 || num > 5) {
    return 'Rating must be an integer between 1 and 5.';
  }
  return null;
}

module.exports = {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  validateRating,
};
