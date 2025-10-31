import { Document, model, models, Schema } from "mongoose";

export interface GameAccountRequestSchemaIn extends Document {
  userId: Schema.Types.ObjectId;
  gameId: Schema.Types.ObjectId;
  gameName: string;
  userEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  generatedUsername?: string;
  generatedPassword?: string;
  adminNotes?: string;
  requestedAmount?:number;
}

const gameAccountRequestSchema = new Schema<GameAccountRequestSchemaIn>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    gameId: {
      type: Schema.Types.ObjectId,
      ref: 'Game',
      required: true
    },
    gameName: {
      type: String,
      required: true
    },
    userEmail: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    generatedUsername: {
      type: String
    },
    generatedPassword: {
      type: String
    },
    adminNotes: {
      type: String
    },
   requestedAmount:{
    type:Number
   }
  },
  { timestamps: true }
);

const GameAccountRequestModel = models.GameAccountRequest || model<GameAccountRequestSchemaIn>("GameAccountRequest", gameAccountRequestSchema);
export default GameAccountRequestModel; 