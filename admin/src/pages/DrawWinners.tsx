import { motion } from "framer-motion";
import {
  Calendar,
  EditIcon,
  Search,
  Sparkles,
  Trophy,
  WrenchIcon,
} from "lucide-react";
import { useState } from "react";
import Table from "../components/UI/Table";
// import { WinnerSelector } from '../components/Winner/WinnerSelector';
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import { WinnerSelector } from "../components/Winner/WinnerSelector";
import {
  useGetAllUsersEntryQuery,
  useUpdateWinnerMutation,
} from "../services/api/entryApi";
import { IUserEntry } from "../types";
// import Button from '../components/UI/Button';

const DrawWinners = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [month, setMonth] = useState("current");
  const [updateWinner, { isLoading: updateLoading }] =
    useUpdateWinnerMutation();
  const {
    isLoading,
    error,
    data: users,
  } = useGetAllUsersEntryQuery({
    month: month,
  });
  console.log(month);
  const [isSelecting, setIsSelecting] = useState(false);
  const [winner, setWinner] = useState<IUserEntry | null>(null);

  const handleDeletePreviousMonth = (value: string) => {
    setMonth(value);
  };

  const handleSelectWinner = () => {
    if (isSelecting) {
      setIsSelecting(false);
    } else {
      setIsSelecting(true);
    }
    setWinner(null);
  };

  const handleWinnerSelected = async (selectedWinner: IUserEntry) => {
    try {
      setIsSelecting(false);
      setWinner(selectedWinner);
      await updateWinner(selectedWinner).unwrap();
    } catch (err) {
      console.log(err);
    }
  };

  const handleEditBalance = (user: IUserEntry) => {
    try {
      console.log(user);
    } catch (err) {
      console.log(err, "ERROR MESSAGE");
    }
  };

  // Table columns
  const columns = [
    {
      header: "User ID",
      accessor: (user: IUserEntry) => `${user._id.slice(20, 24)}`,
    },
    { header: "Name", accessor: (user: IUserEntry) => user.name },
    { header: "Email", accessor: (user: IUserEntry) => user.email },
    { header: "Phone", accessor: (user: IUserEntry) => user.phone },
    {
      header: "Entry Date",
      accessor: (user: IUserEntry) =>
        new Date(user.createdAt).toLocaleDateString(),
    },
   
  ];
  return (
    <>
      <div className="space-y-6">
        <div className="rounded-2xl shadow-2xl overflow-hidden border">
          <div className="px-6 py-4 border-b border-purple-500/30 flex justify-between items-center bg-gradient-to-r from-purple-900 to-indigo-900">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-white animate-glow">
                Free Entry Tournament
              </h1>
            </div>
          </div>

          {(isSelecting || winner) && (
            <div
              className="p-6 bg-gradient-to-r from-purple-900 via-indigo-700 to-purple-900 border-b border-4 border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.8)]
"
            >
              {isSelecting && users?.users && users?.users?.length !== 0 ? (
                <WinnerSelector
                  users={users?.users}
                  isSelecting={isSelecting}
                  onComplete={handleWinnerSelected}
                />
              ) : (
                winner && (
                  <motion.div
                    className="w-full max-w-4xl mx-auto bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 rounded-xl p-8 border-2 border-yellow-500/50"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 0.8 }}
                  >
                    <div className="flex items-center justify-center space-x-8">
                      <div className="relative">
                        <img
                          src={
                            "https://staging.gtoarcade.com/assets/logo-CvSsoyu4.png"
                          }
                          alt={winner.name.toString()}
                          className="w-32 h-32 rounded-full border-4 border-yellow-500 animate-border-glow"
                        />
                        <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-yellow-400 animate-glow" />
                        <Sparkles className="absolute -bottom-3 -left-3 w-8 h-8 text-yellow-400 animate-glow" />
                      </div>
                      <div className="text-center">
                        <h2 className="text-4xl font-bold text-yellow-400 animate-glow mb-2">
                          🏆 Winner 🏆
                        </h2>
                        <p className="text-3xl font-semibold text-white mb-2 capitalize">
                          {winner.name} 😎
                        </p>
                        <p className="text-xl text-purple-300">
                          {winner.email}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              )}
            </div>
          )}

          <Card>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users by mail..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                  }}
                />
                <Search
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={18}
                />
              </div>

              <div className="flex items-center gap-4 space-x-4">
                <div className="space-x-4 flex gap-3">
                  <button
                    onClick={() =>
                      handleDeletePreviousMonth(
                        month !== "current" ? "current" : "previous"
                      )
                    }
                    className="inline-flex items-center px-4 py-2 bg-red-900 border border-red-500 rounded-md shadow-lg text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {month === "current" ? "Previous Month" : "Current Month"}
                  </button>
                  {users?.users?.length !== 0 && (
                    <button
                      onClick={handleSelectWinner}
                      // disabled={isSelecting}
                      className="inline-flex items-center px-4 py-2 bg-purple-900  border border-purple-500 rounded-md shadow-lg text-sm font-medium text-white hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 animate-border-glow"
                    >
                      {isSelecting ? (
                        <WrenchIcon className="w-4 h-4 mr-2 text-yellow-400" />
                      ) : (
                        <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
                      )}
                      {isSelecting ? "Close upper modal" : "Select Winner"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {users && (
              <Table
                isLoading={isLoading}
                columns={columns}
                data={users?.users ? users.users : []}
                keyExtractor={(user) => user._id}
                emptyMessage="No users found matching your criteria"
                rowClassName={(user) =>
                  user.isWinner ? "bg-purple-900 text-white" : ""
                }
              />
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default DrawWinners;
