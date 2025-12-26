import { model, Schema, Document, models } from "mongoose";
import { RoleType, AvailableRoles } from "../constants";

export interface RoleSchemaIn extends Document {
  _id: string;
  name: string;
  description: string;
  permissions: {
    canViewAllUsers: boolean;
    canEditUsers: boolean;
    canDeleteUsers: boolean;
    canCreateUsers: boolean;
    canManageRoles: boolean;
    canViewAllTransactions: boolean;
    canManageGames: boolean;
    canViewReports: boolean;
    canManageSupportTeam: boolean;
    canViewAnalytics: boolean;
    canManageSystem: boolean;
    canManageBanners: boolean;
    canAccessEverything: boolean;
    canViewUserProfiles: boolean;
    canViewTransactions: boolean;
    canViewSupportTickets: boolean;
    canResolveSupportTickets: boolean;
    canModerateContent: boolean;
    canBanUsers: boolean;
    canViewAllData: boolean;
    canGenerateReports: boolean;
    canManageCoupons: boolean;
  };
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
}

const RoleSchema = new Schema<RoleSchemaIn>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    permissions: {
      canViewAllUsers: { type: Boolean, default: false },
      canEditUsers: { type: Boolean, default: false },
      canDeleteUsers: { type: Boolean, default: false },
      canCreateUsers: { type: Boolean, default: false },
      canManageRoles: { type: Boolean, default: false },
      canViewAllTransactions: { type: Boolean, default: false },
      canManageGames: { type: Boolean, default: false },
      canViewReports: { type: Boolean, default: false },
      canManageSupportTeam: { type: Boolean, default: false },
      canViewAnalytics: { type: Boolean, default: false },
      canManageSystem: { type: Boolean, default: false },
      canAccessEverything: { type: Boolean, default: false },
      canViewUserProfiles: { type: Boolean, default: false },
      canViewTransactions: { type: Boolean, default: false },
      canViewSupportTickets: { type: Boolean, default: false },
      canResolveSupportTickets: { type: Boolean, default: false },
      canModerateContent: { type: Boolean, default: false },
      canBanUsers: { type: Boolean, default: false },
      canViewAllData: { type: Boolean, default: false },
      canManageCoupons: { type: Boolean, default: false },
      canGenerateReports: { type: Boolean, default: false },
      canManageBanners: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
  },
  { timestamps: true }
);

const RoleModel = models.Role || model<RoleSchemaIn>("Role", RoleSchema);
export default RoleModel;
