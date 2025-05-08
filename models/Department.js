import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  }
}, {
  timestamps: true
});

const Department = mongoose.model('Department', departmentSchema);

export default Department; 