const { randomBytes, scryptSync } = require('crypto');

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

const senha = "123456"; // MUDA AQUI
console.log(hashPassword(senha));