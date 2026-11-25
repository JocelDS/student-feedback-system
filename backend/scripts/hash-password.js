// Usage: npm run hash-password -- "YourStrongPassword"
const bcrypt = require('bcryptjs');

const password = process.argv[2];
if (!password) {
  console.error('Please provide a password: npm run hash-password -- "YourStrongPassword"');
  process.exit(1);
}
console.log(bcrypt.hashSync(password, 10));
