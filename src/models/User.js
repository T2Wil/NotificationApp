import mongoose from 'mongoose';

const { Schema } = mongoose;
const { ObjectId } = Schema;

const UserSchema = new Schema({
  id: ObjectId,
  email: String,
  password: String,
  isAdmin: Boolean,
  allowedRequestsPerSec: Number,
  allowedRequestsPerMonth: Number,
});

export default mongoose.model('User', UserSchema);
