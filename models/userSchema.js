const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    phoneNumber: String,
    employeeID: String,
    department: String,
    role: String,
    password: String,
    faceRecognitionImage: Buffer,
    faceDescriptor: {
        label: String,
        descriptor: [Number]
      },});

UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});


module.exports = mongoose.model('User', UserSchema);
