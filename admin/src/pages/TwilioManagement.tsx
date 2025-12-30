import React, { useState } from "react";
import {
  MessageSquare,
  Send,
  History,
  X,
  AlertCircle,
  Users,
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import {
  useGetUserSegmentsQuery,
  useSendIndividualSmsMutation,
  useSendBulkSmsMutation,
  useGetSmsHistoryQuery,
} from "../services/api/twilioApi";

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

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
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

const TwilioManagement: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"send" | "audience" | "history">(
    "send"
  );
  const [smsMode, setSmsMode] = useState<"individual" | "bulk">("individual");

  // Individual SMS form
  const [individualSms, setIndividualSms] = useState({
    to: "",
    message: "",
  });

  // Bulk SMS form
  const [bulkSmsData, setBulkSmsData] = useState({
    segment: "all",
    message: "",
  });

  // RTK Query hooks
  const { data: segments, isLoading: segmentsLoading } =
    useGetUserSegmentsQuery();
  const { data: smsHistory = [], isLoading: historyLoading } =
    useGetSmsHistoryQuery();

  // Mutations
  const [sendIndividualSms, { isLoading: sendingIndividual }] =
    useSendIndividualSmsMutation();
  const [sendBulkSms, { isLoading: sendingBulk }] = useSendBulkSmsMutation();

  const handleSendIndividual = async () => {
    if (!individualSms.to || !individualSms.message) {
      showToast("Please fill all fields", "error");
      return;
    }

    try {
      await sendIndividualSms(individualSms).unwrap();
      showToast("SMS sent successfully!", "success");
      setIndividualSms({ to: "", message: "" });
    } catch (error: any) {
      showToast(error?.data?.message || "Failed to send SMS", "error");
    }
  };

  const handleSendBulk = async () => {
    if (!bulkSmsData.message) {
      showToast("Please fill all required fields", "error");
      return;
    }

    const recipientCount = getRecipientCount(bulkSmsData.segment);
    if (!window.confirm(`Send SMS to ${recipientCount} users?`)) return;

    try {
      await sendBulkSms(bulkSmsData).unwrap();
      showToast(`SMS sent to ${recipientCount} users!`, "success");
      setBulkSmsData({
        segment: "all",
        message: "",
      });
    } catch (error: any) {
      showToast(error?.data?.message || "Failed to send bulk SMS", "error");
    }
  };

  const getRecipientCount = (segment: string) => {
    if (!segments) return 0;
    switch (segment) {
      case "all":
        return segments.smsOptIn;
      case "active":
        return segments.activeSmsUsers || 0;
      case "inactive":
        return segments.inactiveSmsUsers || 0;
      case "vip":
        return segments.vipSmsUsers || 0;
      default:
        return 0;
    }
  };

  const tabs = [
    { id: "send" as const, label: "Send SMS", icon: Send },
    { id: "audience" as const, label: "Audience", icon: Users },
    { id: "history" as const, label: "History", icon: History },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">SMS Marketing</h1>

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
          {/* Send SMS Tab */}
          {activeTab === "send" && (
            <div className="space-y-6">
              {/* Mode Toggle */}
              <div className="flex items-center justify-center space-x-4 pb-4 border-b">
                <button
                  onClick={() => setSmsMode("individual")}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    smsMode === "individual"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <MessageSquare className="inline mr-2" size={18} />
                  Individual SMS
                </button>
                <button
                  onClick={() => setSmsMode("bulk")}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    smsMode === "bulk"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Send className="inline mr-2" size={18} />
                  Bulk SMS
                </button>
              </div>

              {/* Individual SMS Form */}
              {smsMode === "individual" && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex">
                      <AlertCircle
                        className="text-blue-600 mr-2 flex-shrink-0"
                        size={18}
                      />
                      <p className="text-sm text-blue-800">
                        Send a personalized SMS to a single recipient
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={individualSms.to}
                      onChange={(e) =>
                        setIndividualSms({
                          ...individualSms,
                          to: e.target.value,
                        })
                      }
                      placeholder="+1234567890"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={6}
                      value={individualSms.message}
                      onChange={(e) =>
                        setIndividualSms({
                          ...individualSms,
                          message: e.target.value,
                        })
                      }
                      placeholder="Enter your SMS message here..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {individualSms.message.length}/160 characters
                    </p>
                  </div>

                  <button
                    onClick={handleSendIndividual}
                    disabled={sendingIndividual}
                    className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {sendingIndividual ? "Sending..." : "Send SMS"}
                  </button>
                </div>
              )}

              {/* Bulk SMS Form */}
              {smsMode === "bulk" && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex">
                      <AlertCircle
                        className="text-blue-600 mr-2 flex-shrink-0"
                        size={18}
                      />
                      <p className="text-sm text-blue-800">
                        Send bulk SMS to multiple users who have opted in for
                        SMS notifications
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Audience <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={bulkSmsData.segment}
                      onChange={(e) =>
                        setBulkSmsData({
                          ...bulkSmsData,
                          segment: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">
                        All Users ({segments?.smsOptIn || 0})
                      </option>
                      <option value="active">
                        Active Users ({segments?.activeSmsUsers || 0})
                      </option>
                      <option value="inactive">
                        Inactive Users ({segments?.inactiveSmsUsers || 0})
                      </option>
                      <option value="vip">
                        VIP Users ({segments?.vipSmsUsers || 0})
                      </option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Will send to {getRecipientCount(bulkSmsData.segment)}{" "}
                      users
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={6}
                      value={bulkSmsData.message}
                      onChange={(e) =>
                        setBulkSmsData({
                          ...bulkSmsData,
                          message: e.target.value,
                        })
                      }
                      placeholder="🎮 New tournament this weekend! Register now at valgame.com/tournament"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {bulkSmsData.message.length}/160 characters
                    </p>
                  </div>

                  <button
                    onClick={handleSendBulk}
                    disabled={sendingBulk}
                    className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {sendingBulk
                      ? "Sending..."
                      : `Send to ${getRecipientCount(
                          bulkSmsData.segment
                        )} Users`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Audience Tab */}
          {activeTab === "audience" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">
                SMS Audience
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
                      <MessageSquare size={24} />
                      <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                        {segments
                          ? Math.round(
                              (segments.smsOptIn / segments.totalUsers) * 100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold">
                      {segments?.smsOptIn || 0}
                    </h3>
                    <p className="text-sm opacity-90">SMS Opt-in</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Users size={24} />
                      <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                        Active
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold">
                      {segments?.activeSmsUsers || 0}
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
                      {segments?.vipSmsUsers || 0}
                    </h3>
                    <p className="text-sm opacity-90">VIP Users</p>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-md font-semibold text-gray-800 mb-4">
                  SMS Cost Estimate
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Cost per SMS</span>
                    <span className="font-semibold text-gray-800">$0.0075</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      Sending to all SMS users
                    </span>
                    <span className="font-semibold text-gray-800">
                      ${((segments?.smsOptIn || 0) * 0.0075).toFixed(2)}
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
                SMS History
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
                          To
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Message
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
                      {smsHistory.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No SMS sent yet. Send your first SMS to get started.
                          </td>
                        </tr>
                      ) : (
                        smsHistory.map((sms: any) => (
                          <tr key={sms.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  sms.type === "bulk"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {sms.type === "bulk" ? "Bulk" : "Individual"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {sms.recipientCount
                                ? `${sms.recipientCount} users`
                                : sms.to}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                              {sms.message}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  sms.status === "delivered"
                                    ? "bg-green-100 text-green-800"
                                    : sms.status === "failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {sms.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(sms.sentAt).toLocaleString()}
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
    </div>
  );
};

export default TwilioManagement;
