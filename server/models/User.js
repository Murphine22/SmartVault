const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User schema for authentication and document ownership.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: false },
    authProvider: { type: String, enum: ['local', 'auth0'], default: 'local' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isInvited: { type: Boolean, default: false },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    invitationToken: { type: String, default: null },
    invitationAcceptedAt: { type: Date, default: null },
    storageLimit: { type: Number, default: 52428800 },
    refreshTokens: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Hash the password before saving the document.
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare a plaintext password with the stored hash.
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
