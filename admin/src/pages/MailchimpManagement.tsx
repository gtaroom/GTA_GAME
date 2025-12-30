import React, { useState } from "react";
import { Send, Users, History, X, Mail, AlertCircle } from "lucide-react";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import {
  useGetUserSegmentsQuery,
  useSendIndividualEmailMutation,
  useSendEmailCampaignMutation,
  useGetEmailHistoryQuery,
} from "../services/api/mailchimpApi";

// Modal Component
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const MailchimpManagement: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"send" | "audience" | "history">(
    "send"
  );
  const [emailMode, setEmailMode] = useState<"individual" | "campaign">(
    "individual"
  );

  // Individual email form
  const [individualEmail, setIndividualEmail] = useState({
    to: "",
    subject: "",
    message: "",
  });

  // Campaign form
  const [campaignData, setCampaignData] = useState({
    subject: "",
    segment: "all",
    htmlContent: "",
  });

  // Preview modal
  const [previewModal, setPreviewModal] = useState(false);

  // RTK Query hooks
  const { data: segments, isLoading: segmentsLoading } =
    useGetUserSegmentsQuery();
  const { data: history = [], isLoading: historyLoading } =
    useGetEmailHistoryQuery();

  // Mutations
  const [sendIndividualEmail, { isLoading: sendingIndividual }] =
    useSendIndividualEmailMutation();
  const [sendCampaign, { isLoading: sendingCampaign }] =
    useSendEmailCampaignMutation();

  const handleSendIndividual = async () => {
    if (
      !individualEmail.to ||
      !individualEmail.subject ||
      !individualEmail.message
    ) {
      showToast("Please fill all fields", "error");
      return;
    }

    try {
      await sendIndividualEmail(individualEmail).unwrap();
      showToast("Email sent successfully!", "success");
      setIndividualEmail({ to: "", subject: "", message: "" });
    } catch (error: any) {
      showToast(error?.data?.message || "Failed to send email", "error");
    }
  };

  const handleSendCampaign = async () => {
    if (!campaignData.subject || !campaignData.htmlContent) {
      showToast("Please fill all required fields", "error");
      return;
    }

    const recipientCount = getRecipientCount(campaignData.segment);
    if (!window.confirm(`Send campaign to ${recipientCount} users?`)) return;

    try {
      await sendCampaign(campaignData).unwrap();
      showToast(`Campaign sent to ${recipientCount} users!`, "success");
      setCampaignData({
        subject: "",
        segment: "all",
        htmlContent: "",
      });
    } catch (error: any) {
      showToast(error?.data?.message || "Failed to send campaign", "error");
    }
  };

  const getRecipientCount = (segment: string) => {
    if (!segments) return 0;
    switch (segment) {
      case "all":
        return segments.emailOptIn;
      case "active":
        return segments.activeUsers;
      case "inactive":
        return segments.inactiveUsers;
      case "vip":
        return segments.vipUsers;
      default:
        return 0;
    }
  };

  const tabs = [
    { id: "send" as const, label: "Send Email", icon: Send },
    { id: "audience" as const, label: "Audience", icon: Users },
    { id: "history" as const, label: "History", icon: History },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Email Marketing</h1>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors
                    ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  <Icon size={18} className="mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Send Email Tab */}
          {activeTab === "send" && (
            <div className="space-y-6">
              {/* Mode Toggle */}
              <div className="flex items-center justify-center space-x-4 pb-4 border-b">
                <button
                  onClick={() => setEmailMode("individual")}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    emailMode === "individual"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Mail className="inline mr-2" size={18} />
                  Individual Email
                </button>
                <button
                  onClick={() => setEmailMode("campaign")}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    emailMode === "campaign"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Send className="inline mr-2" size={18} />
                  Campaign (Bulk)
                </button>
              </div>

              {/* Individual Email Form */}
              {emailMode === "individual" && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex">
                      <AlertCircle
                        className="text-blue-600 mr-2 flex-shrink-0"
                        size={18}
                      />
                      <p className="text-sm text-blue-800">
                        Send a personalized email to a single recipient
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={individualEmail.to}
                      onChange={(e) =>
                        setIndividualEmail({
                          ...individualEmail,
                          to: e.target.value,
                        })
                      }
                      placeholder="user@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={individualEmail.subject}
                      onChange={(e) =>
                        setIndividualEmail({
                          ...individualEmail,
                          subject: e.target.value,
                        })
                      }
                      placeholder="Email subject"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={10}
                      value={individualEmail.message}
                      onChange={(e) =>
                        setIndividualEmail({
                          ...individualEmail,
                          message: e.target.value,
                        })
                      }
                      placeholder="Enter your email content here..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={handleSendIndividual}
                    disabled={sendingIndividual}
                    className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {sendingIndividual ? "Sending..." : "Send Email"}
                  </button>
                </div>
              )}

              {/* Campaign Form */}
              {emailMode === "campaign" && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex">
                      <AlertCircle
                        className="text-blue-600 mr-2 flex-shrink-0"
                        size={18}
                      />
                      <p className="text-sm text-blue-800">
                        Send bulk email to multiple users who have opted in for
                        email notifications
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject Line <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={campaignData.subject}
                      onChange={(e) =>
                        setCampaignData({
                          ...campaignData,
                          subject: e.target.value,
                        })
                      }
                      placeholder="🎮 New Tournament Starting This Weekend!"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Audience <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={campaignData.segment}
                      onChange={(e) =>
                        setCampaignData({
                          ...campaignData,
                          segment: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">
                        All Users ({segments?.emailOptIn || 0})
                      </option>
                      <option value="active">
                        Active Users ({segments?.activeUsers || 0})
                      </option>
                      <option value="inactive">
                        Inactive Users ({segments?.inactiveUsers || 0})
                      </option>
                      <option value="vip">
                        VIP Users ({segments?.vipUsers || 0})
                      </option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Will send to {getRecipientCount(campaignData.segment)}{" "}
                      users
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Content (HTML){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={12}
                      value={campaignData.htmlContent}
                      onChange={(e) =>
                        setCampaignData({
                          ...campaignData,
                          htmlContent: e.target.value,
                        })
                      }
                      placeholder="<h1>Hello!</h1><p>Your email content here...</p>"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setPreviewModal(true)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Preview
                    </button>
                    <button
                      onClick={handleSendCampaign}
                      disabled={sendingCampaign}
                      className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {sendingCampaign
                        ? "Sending..."
                        : `Send to ${getRecipientCount(
                            campaignData.segment
                          )} Users`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Audience Tab */}
          {activeTab === "audience" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">
                User Segments
              </h2>

              {segmentsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" text="Loading audience data..." />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Users size={24} />
                      <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                        Total
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold">
                      {segments?.totalUsers || 0}
                    </h3>
                    <p className="text-sm opacity-90">Total Users</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Mail size={24} />
                      <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                        {segments
                          ? Math.round(
                              (segments.emailOptIn / segments.totalUsers) * 100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold">
                      {segments?.emailOptIn || 0}
                    </h3>
                    <p className="text-sm opacity-90">Email Opt-in</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Users size={24} />
                      <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                        Active
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold">
                      {segments?.activeUsers || 0}
                    </h3>
                    <p className="text-sm opacity-90">Active (30 days)</p>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Users size={24} />
                      <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                        VIP
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold">
                      {segments?.vipUsers || 0}
                    </h3>
                    <p className="text-sm opacity-90">VIP Users</p>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-md font-semibold text-gray-800 mb-4">
                  Segment Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      Inactive Users (60+ days)
                    </span>
                    <span className="font-semibold text-gray-800">
                      {segments?.inactiveUsers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">SMS Opt-in</span>
                    <span className="font-semibold text-gray-800">
                      {segments?.smsOptIn || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Email History
              </h2>

              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" text="Loading history..." />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Recipients
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sent At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {history.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No emails sent yet. Send your first email to get
                            started.
                          </td>
                        </tr>
                      ) : (
                        history.map((email: any) => (
                          <tr key={email.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  email.type === "campaign"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {email.type === "campaign"
                                  ? "Campaign"
                                  : "Individual"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {email.subject}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {email.recipientCount || 1} user
                              {email.recipientCount > 1 ? "s" : ""}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  email.status === "sent"
                                    ? "bg-green-100 text-green-800"
                                    : email.status === "failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {email.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(email.sentAt).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={previewModal}
        onClose={() => setPreviewModal(false)}
        title="Email Preview"
      >
        <div className="space-y-4">
          <div className="border-b pb-3">
            <p className="text-sm text-gray-600">Subject:</p>
            <p className="font-medium">
              {campaignData.subject || "(No subject)"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Content:</p>
            <div
              className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto"
              dangerouslySetInnerHTML={{
                __html:
                  campaignData.htmlContent ||
                  '<p class="text-gray-400">(No content)</p>',
              }}
            />
          </div>
          <div className="flex justify-end pt-4">
            <button
              onClick={() => setPreviewModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MailchimpManagement;
