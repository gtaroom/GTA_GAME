import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  BarChart3, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  AlertTriangle,
  Save,
  RefreshCw,
  TrendingUp,
  Users,
  Gift,
  DollarSign
} from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Modal from '../components/UI/Modal';
import Table from '../components/UI/Table';
import { useToast } from '../context/ToastContext';
import { usePermissions } from '../hooks/usePermissions';
import {
  useGetSpinWheelConfigQuery,
  useUpdateSpinWheelConfigMutation,
  useValidateSpinWheelConfigQuery,
  useGetSpinWheelStatsQuery,
  SpinWheelConfig,
  Reward,
  RarityType,
  RewardType,
  Threshold,
  ValidationResult
} from '../services/api/spinWheelApi';

const SpinWheelManagement: React.FC = () => {
  const { user } = usePermissions();
  const { showToast } = useToast();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'config' | 'stats' | 'validation'>('config');
  
  // Config state
  const [config, setConfig] = useState<SpinWheelConfig | null>(null);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [editingThreshold, setEditingThreshold] = useState<Threshold | null>(null);
  
  // Form states
  const [rewardForm, setRewardForm] = useState<Partial<Reward>>({
    id: 0,
    amount: 0,
    type: 'GC',
    rarity: 'common',
    probability: 0,
    description: '',
    isActive: true
  });
  
  const [thresholdForm, setThresholdForm] = useState<Partial<Threshold>>({
    id: '',
    spendingAmount: 0,
    spinsAwarded: 1,
    isActive: true
  });

  // API hooks
  const { 
    data: configData, 
    isLoading: configLoading, 
    refetch: refetchConfig 
  } = useGetSpinWheelConfigQuery(undefined, {
    refetchOnMountOrArgChange: true
  });

  const { 
    data: stats, 
    isLoading: statsLoading, 
    refetch: refetchStats 
  } = useGetSpinWheelStatsQuery();

  const { 
    data: validation, 
    refetch: refetchValidation 
  } = useValidateSpinWheelConfigQuery();

  const [updateConfig, { isLoading: updating }] = useUpdateSpinWheelConfigMutation();

  // Check if user is ADMIN
  const isAdmin = user?.role === 'ADMIN';

  // Load config into state when fetched
  useEffect(() => {
    if (configData) {
      setConfig(configData);
    }
  }, [configData]);

  // Permission check
  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have permission to manage spin wheel. Only ADMIN users can access this page.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Handlers
  const handleSaveConfig = async () => {
    if (!config) return;

    try {
      const result = await updateConfig(config).unwrap();
      
      if (result.validation.valid) {
        showToast('Configuration saved successfully!', 'success');
      } else {
        showToast('Configuration saved but has validation issues', 'error');
      }
      
      refetchConfig();
      refetchValidation();
    } catch (error: any) {
      showToast(error?.data?.message || 'Failed to save configuration', 'error');
    }
  };

  const handleValidate = async () => {
    await refetchValidation();
    if (validation) {
      if (validation.valid) {
        showToast('Configuration is valid!', 'success');
      } else {
        showToast('Configuration has validation issues', 'error');
      }
    }
  };

  const handleAddReward = () => {
    const newId = config?.rewards.length 
      ? Math.max(...config.rewards.map(r => r.id)) + 1 
      : 1;
    
    setRewardForm({
      id: newId,
      amount: 0,
      type: 'GC',
      rarity: 'common',
      probability: 0,
      description: '',
      isActive: true
    });
    setEditingReward(null);
    setIsRewardModalOpen(true);
  };

  const handleEditReward = (reward: Reward) => {
    setRewardForm(reward);
    setEditingReward(reward);
    setIsRewardModalOpen(true);
  };

  const handleDeleteReward = (rewardId: number) => {
    if (!config) return;
    if (window.confirm('Are you sure you want to delete this reward?')) {
      setConfig({
        ...config,
        rewards: config.rewards.filter(r => r.id !== rewardId)
      });
      showToast('Reward deleted', 'success');
    }
  };

  const handleSaveReward = () => {
    if (!config || !rewardForm.id) return;

    const reward: Reward = {
      id: rewardForm.id,
      amount: rewardForm.amount || 0,
      type: rewardForm.type || 'GC',
      rarity: rewardForm.rarity || 'common',
      probability: rewardForm.probability || 0,
      description: rewardForm.description || '',
      isActive: rewardForm.isActive ?? true
    };

    if (editingReward) {
      setConfig({
        ...config,
        rewards: config.rewards.map(r => r.id === reward.id ? reward : r)
      });
      showToast('Reward updated', 'success');
    } else {
      setConfig({
        ...config,
        rewards: [...config.rewards, reward]
      });
      showToast('Reward added', 'success');
    }

    setIsRewardModalOpen(false);
    setRewardForm({
      id: 0,
      amount: 0,
      type: 'GC',
      rarity: 'common',
      probability: 0,
      description: '',
      isActive: true
    });
    setEditingReward(null);
  };

  const handleAddThreshold = () => {
    const newId = `threshold_${Date.now()}`;
    setThresholdForm({
      id: newId,
      spendingAmount: 0,
      spinsAwarded: 1,
      isActive: true
    });
    setEditingThreshold(null);
    setIsThresholdModalOpen(true);
  };

  const handleEditThreshold = (threshold: Threshold) => {
    setThresholdForm(threshold);
    setEditingThreshold(threshold);
    setIsThresholdModalOpen(true);
  };

  const handleDeleteThreshold = (thresholdId: string) => {
    if (!config) return;
    if (window.confirm('Are you sure you want to delete this threshold?')) {
      setConfig({
        ...config,
        triggers: {
          ...config.triggers,
          threshold: {
            ...config.triggers.threshold,
            thresholds: config.triggers.threshold.thresholds.filter(t => t.id !== thresholdId)
          }
        }
      });
      showToast('Threshold deleted', 'success');
    }
  };

  const handleSaveThreshold = () => {
    if (!config || !thresholdForm.id) return;

    const threshold: Threshold = {
      id: thresholdForm.id,
      spendingAmount: thresholdForm.spendingAmount || 0,
      spinsAwarded: thresholdForm.spinsAwarded || 1,
      isActive: thresholdForm.isActive ?? true
    };

    if (editingThreshold) {
      setConfig({
        ...config,
        triggers: {
          ...config.triggers,
          threshold: {
            ...config.triggers.threshold,
            thresholds: config.triggers.threshold.thresholds.map(t => 
              t.id === threshold.id ? threshold : t
            )
          }
        }
      });
      showToast('Threshold updated', 'success');
    } else {
      setConfig({
        ...config,
        triggers: {
          ...config.triggers,
          threshold: {
            ...config.triggers.threshold,
            thresholds: [...config.triggers.threshold.thresholds, threshold]
          }
        }
      });
      showToast('Threshold added', 'success');
    }

    setIsThresholdModalOpen(false);
    setThresholdForm({
      id: '',
      spendingAmount: 0,
      spinsAwarded: 1,
      isActive: true
    });
    setEditingThreshold(null);
  };

  const calculateTotalProbability = () => {
    if (!config) return 0;
    return config.rewards.reduce((sum, r) => sum + (r.isActive ? r.probability : 0), 0);
  };

  if (configLoading) {
    return <LoadingSpinner size="lg" text="Loading spin wheel configuration..." />;
  }

  if (!config) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Configuration Found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Spin wheel configuration not found. Please contact support.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const totalProbability = calculateTotalProbability();
  const probabilityWarning = Math.abs(totalProbability - 100) > 0.1;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Spin Wheel Management</h1>
          <p className="text-gray-600">Configure rewards, triggers, and view statistics</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={handleValidate}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Validate
          </Button>
          <Button
            onClick={handleSaveConfig}
            isLoading={updating}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('config')}
            className={`${
              activeTab === 'config'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`${
              activeTab === 'stats'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistics
          </button>
          <button
            onClick={() => setActiveTab('validation')}
            className={`${
              activeTab === 'validation'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Validation
          </button>
        </nav>
      </div>

      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">General Settings</h2>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Spin Wheel Status</label>
                <p className="text-sm text-gray-500">Enable or disable the spin wheel system</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.isActive}
                  onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </Card>

          {/* Rewards Management */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Rewards Management</h2>
              <Button onClick={handleAddReward} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Reward
              </Button>
            </div>

            {/* Probability Warning */}
            {probabilityWarning && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800">
                    Total probability is {totalProbability.toFixed(2)}%, should be close to 100%
                  </p>
                </div>
              </div>
            )}

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Total Probability: <span className="font-semibold">{totalProbability.toFixed(2)}%</span>
              </p>
            </div>

            <Table
              columns={[
                {
                  header: 'ID',
                  accessor: (reward: Reward) => <span className="font-mono">{reward.id}</span>
                },
                {
                  header: 'Amount',
                  accessor: (reward: Reward) => (
                    <span className="font-semibold">
                      {reward.amount} {reward.type}
                    </span>
                  )
                },
                {
                  header: 'Type',
                  accessor: (reward: Reward) => (
                    <span className={`px-2 py-1 rounded text-xs ${
                      reward.type === 'GC' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {reward.type}
                    </span>
                  )
                },
                {
                  header: 'Rarity',
                  accessor: (reward: Reward) => (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      reward.rarity === 'common' ? 'bg-gray-100 text-gray-800' :
                      reward.rarity === 'uncommon' ? 'bg-green-100 text-green-800' :
                      reward.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                      reward.rarity === 'very_rare' ? 'bg-purple-100 text-purple-800' :
                      reward.rarity === 'ultra_rare' ? 'bg-pink-100 text-pink-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {reward.rarity.replace('_', ' ').toUpperCase()}
                    </span>
                  )
                },
                {
                  header: 'Probability',
                  accessor: (reward: Reward) => (
                    <span className="font-semibold">{reward.probability}%</span>
                  )
                },
                {
                  header: 'Description',
                  accessor: (reward: Reward) => reward.description
                },
                {
                  header: 'Status',
                  accessor: (reward: Reward) => (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      reward.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {reward.isActive ? 'Active' : 'Inactive'}
                    </span>
                  )
                },
                {
                  header: 'Actions',
                  accessor: (reward: Reward) => (
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditReward(reward)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteReward(reward.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                }
              ]}
              data={config.rewards}
              keyExtractor={(reward) => reward.id.toString()}
              emptyMessage="No rewards configured"
            />
          </Card>

          {/* Triggers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* First-Time Trigger */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">First-Time Trigger</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Enabled</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.triggers.firstTime.enabled}
                      onChange={(e) => setConfig({
                        ...config,
                        triggers: {
                          ...config.triggers,
                          firstTime: {
                            ...config.triggers.firstTime,
                            enabled: e.target.checked
                          }
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spins Per User
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={config.triggers.firstTime.spinsPerUser}
                    onChange={(e) => setConfig({
                      ...config,
                      triggers: {
                        ...config.triggers,
                        firstTime: {
                          ...config.triggers.firstTime,
                          spinsPerUser: parseInt(e.target.value) || 0
                        }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </Card>

            {/* Random Trigger */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Random Trigger</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Enabled</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.triggers.random.enabled}
                      onChange={(e) => setConfig({
                        ...config,
                        triggers: {
                          ...config.triggers,
                          random: {
                            ...config.triggers.random,
                            enabled: e.target.checked
                          }
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Probability (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={config.triggers.random.probability}
                    onChange={(e) => setConfig({
                      ...config,
                      triggers: {
                        ...config.triggers,
                        random: {
                          ...config.triggers.random,
                          probability: parseFloat(e.target.value) || 0
                        }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cooldown (Hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={config.triggers.random.cooldownHours}
                    onChange={(e) => setConfig({
                      ...config,
                      triggers: {
                        ...config.triggers,
                        random: {
                          ...config.triggers.random,
                          cooldownHours: parseInt(e.target.value) || 0
                        }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </Card>

            {/* Threshold Trigger */}
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Threshold Trigger</h3>
                <Button onClick={handleAddThreshold} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Enabled</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.triggers.threshold.enabled}
                      onChange={(e) => setConfig({
                        ...config,
                        triggers: {
                          ...config.triggers,
                          threshold: {
                            ...config.triggers.threshold,
                            enabled: e.target.checked
                          }
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="space-y-2">
                  {config.triggers.threshold.thresholds.map((threshold) => (
                    <div key={threshold.id} className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">${threshold.spendingAmount}</p>
                        <p className="text-xs text-gray-500">{threshold.spinsAwarded} spins</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditThreshold(threshold)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteThreshold(threshold.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {config.triggers.threshold.thresholds.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No thresholds configured</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {statsLoading ? (
            <LoadingSpinner size="lg" text="Loading statistics..." />
          ) : stats ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Spins</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalSpins}</p>
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Users with Spins</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.usersWithSpins}</p>
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center">
                    <Gift className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Spins Available</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalSpinsAvailable}</p>
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Rewards (GC)</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalRewardsGiven.GC.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Spins by Rarity */}
              <Card>
                <h2 className="text-lg font-semibold mb-4">Spins by Rarity</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(stats.spinsByRarity).map(([rarity, count]) => (
                    <div key={rarity} className="p-4 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-600 capitalize">{rarity.replace('_', ' ')}</p>
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Spins */}
              <Card>
                <h2 className="text-lg font-semibold mb-4">Recent Spins</h2>
                <Table
                  columns={[
                    {
                      header: 'User',
                      accessor: (spin) => (
                        <div>
                          <p className="font-medium">
                            {spin.userId.name.first} {spin.userId.name.last}
                          </p>
                          <p className="text-xs text-gray-500">{spin.userId.email}</p>
                        </div>
                      )
                    },
                    {
                      header: 'Reward',
                      accessor: (spin) => (
                        <div>
                          <p className="font-semibold">
                            {spin.amount} {spin.type}
                          </p>
                          <p className="text-xs text-gray-500">{spin.description}</p>
                        </div>
                      )
                    },
                    {
                      header: 'Rarity',
                      accessor: (spin) => (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          spin.rarity === 'common' ? 'bg-gray-100 text-gray-800' :
                          spin.rarity === 'uncommon' ? 'bg-green-100 text-green-800' :
                          spin.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                          spin.rarity === 'very_rare' ? 'bg-purple-100 text-purple-800' :
                          spin.rarity === 'ultra_rare' ? 'bg-pink-100 text-pink-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {spin.rarity.replace('_', ' ').toUpperCase()}
                        </span>
                      )
                    },
                    {
                      header: 'Spun At',
                      accessor: (spin) => new Date(spin.spunAt).toLocaleString()
                    },
                    {
                      header: 'Claimed At',
                      accessor: (spin) => spin.claimedAt 
                        ? new Date(spin.claimedAt).toLocaleString() 
                        : 'Not claimed'
                    }
                  ]}
                  data={stats.recentSpins}
                  keyExtractor={(spin) => spin._id}
                  emptyMessage="No recent spins"
                />
              </Card>
            </>
          ) : (
            <Card>
              <div className="text-center py-8">
                <p className="text-gray-500">No statistics available</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Validation Tab */}
      {activeTab === 'validation' && (
        <div className="space-y-6">
          {validation && (
            <Card>
              <div className={`p-4 rounded-md mb-4 ${
                validation.valid 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center">
                  {validation.valid ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  )}
                  <h3 className={`text-lg font-semibold ${
                    validation.valid ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {validation.valid ? 'Configuration is Valid' : 'Configuration has Issues'}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Total Probability: <span className="font-semibold">{validation.totalProbability.toFixed(2)}%</span>
                </p>
              </div>

              {validation.issues.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold mb-2">Issues Found:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {validation.issues.map((issue, index) => (
                      <li key={index} className="text-sm text-red-600">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validation.valid && (
                <div className="mt-4 p-3 bg-green-50 rounded-md">
                  <p className="text-sm text-green-800">
                    ✓ All validation checks passed. Configuration is ready to use.
                  </p>
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Reward Modal */}
      <Modal
        isOpen={isRewardModalOpen}
        onClose={() => setIsRewardModalOpen(false)}
        title={editingReward ? 'Edit Reward' : 'Add Reward'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
            <input
              type="number"
              value={rewardForm.id}
              onChange={(e) => setRewardForm({ ...rewardForm, id: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!!editingReward}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              min="0"
              value={rewardForm.amount}
              onChange={(e) => setRewardForm({ ...rewardForm, amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={rewardForm.type}
              onChange={(e) => setRewardForm({ ...rewardForm, type: e.target.value as RewardType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="GC">GC (Gold Coins)</option>
              <option value="SC">SC (Silver Coins)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rarity</label>
            <select
              value={rewardForm.rarity}
              onChange={(e) => setRewardForm({ ...rewardForm, rarity: e.target.value as RarityType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="very_rare">Very Rare</option>
              <option value="ultra_rare">Ultra Rare</option>
              <option value="top_reward">Top Reward</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Probability</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={rewardForm.probability}
              onChange={(e) => setRewardForm({ ...rewardForm, probability: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={rewardForm.description}
              onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={rewardForm.isActive}
              onChange={(e) => setRewardForm({ ...rewardForm, isActive: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">Active</label>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsRewardModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveReward}>
              {editingReward ? 'Update' : 'Add'} Reward
            </Button>
          </div>
        </div>
      </Modal>

      {/* Threshold Modal */}
      <Modal
        isOpen={isThresholdModalOpen}
        onClose={() => setIsThresholdModalOpen(false)}
        title={editingThreshold ? 'Edit Threshold' : 'Add Threshold'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
            <input
              type="text"
              value={thresholdForm.id}
              onChange={(e) => setThresholdForm({ ...thresholdForm, id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!!editingThreshold}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Spending Amount ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={thresholdForm.spendingAmount}
              onChange={(e) => setThresholdForm({ ...thresholdForm, spendingAmount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Spins Awarded</label>
            <input
              type="number"
              min="1"
              value={thresholdForm.spinsAwarded}
              onChange={(e) => setThresholdForm({ ...thresholdForm, spinsAwarded: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={thresholdForm.isActive}
              onChange={(e) => setThresholdForm({ ...thresholdForm, isActive: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">Active</label>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsThresholdModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveThreshold}>
              {editingThreshold ? 'Update' : 'Add'} Threshold
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SpinWheelManagement;


