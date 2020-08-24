import mongoose from 'mongoose';

const { Schema } = mongoose;
const { ObjectId } = Schema;

const userSchema = new Schema({
  id: ObjectId,
  ip: String,
  maxRequestsPerSec: Number,
  maxRequestsPerMonth: Number,
  requestsMadeInMonth: Number,
});

export default mongoose.model('User', userSchema);
