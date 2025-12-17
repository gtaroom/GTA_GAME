import { Document, model, models, Schema } from "mongoose";

export interface UserGameAccountSchemaIn extends Document {
  userId: Schema.Types.ObjectId;
  gameId: Schema.Types.ObjectId;
  gameName: string;
  username: string;
  password: string;
  hasExistingAccount: boolean;
  isCredentialsStored: boolean;
}

const userGameAccountSchema = new Schema<UserGameAccountSchemaIn>(
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
    username: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    hasExistingAccount: {
      type: Boolean,
      default: false
    },
    isCredentialsStored: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Create compound index to ensure one account per user per game
userGameAccountSchema.index({ userId: 1, gameId: 1 }, { unique: true });

const UserGameAccountModel = models.UserGameAccount || model<UserGameAccountSchemaIn>("UserGameAccount", userGameAccountSchema);
export default UserGameAccountModel; 