import { useEffect, useState } from 'react';
import { Container, Typography, Button, Card, CardContent, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { WhatsappShareButton, TwitterShareButton, LinkedinShareButton, WhatsappIcon, TwitterIcon, LinkedinIcon } from 'react-share';
import { Trophy, Medal, Award, Droplets, Users, Target, Share2, TrendingUp, Leaf, Zap } from 'lucide-react';

type ImpactData = {
  months: string[];
  communityData: number[];
  individualData: number[];
  rainfallData: number[];
  totalCommunityWater: number;
  totalIndividualWater: number;
  userScore: number;
  userRank: number;
  totalParticipants: number;
  equivalents: {
    olympicPools: number;
    households: number;
    trees: number;
    carbonOffset: number;
  };
  achievements: Array<{
    id: number;
    title: string;
    description: string;
    earned: boolean;
    icon: string;
  }>;
};

type Neighbor = {
  id: number;
  name: string;
  score: number;
  waterSaved: number;
  rank: number;
  avatar: string;
};

type LeaderboardData = {
  neighbors: Neighbor[];
  userPosition: number;
  totalParticipants: number;
};

const CommunityImpactDashboard = () => {
  const [impact, setImpact] = useState<ImpactData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [shareMessages, setShareMessages] = useState<{
    whatsapp: string;
    twitter: string;
    linkedin: string;
  } | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [impactRes, leaderboardRes, shareRes] = await Promise.all([
          fetch('/api/community/impact'),
          fetch('/api/community/leaderboard'),
          fetch('/api/community/share-message')
        ]);

        const impactData = await impactRes.json();
        const leaderboardData = await leaderboardRes.json();
        const shareData = await shareRes.json();

        setImpact(impactData);
        setLeaderboard(leaderboardData);
        setShareMessages(shareData);
      } catch {
        // Mock data fallback
        setImpact({
          months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
          communityData: [45000,52000,48000,38000,25000,65000,78000,72000,58000,42000,35000,40000],
          individualData: [1200,1400,1300,1000,650,1800,2100,1950,1600,1150,950,1100],
          rainfallData: [25,30,28,20,12,45,55,52,38,25,18,22],
          totalCommunityWater: 598000,
          totalIndividualWater: 15800,
          userScore: 82,
          userRank: 3,
          totalParticipants: 8,
          equivalents: { olympicPools: 0, households: 3, trees: 598, carbonOffset: 179 },
          achievements: [
            { id: 1, title: 'Water Warrior', description: 'Saved over 10,000 liters', earned: true, icon: '💧' },
            { id: 2, title: 'Top 5 Saver', description: 'Ranked in top 5 neighbours', earned: true, icon: '🏆' },
            { id: 3, title: 'Consistency King', description: 'Saved water for 6 months straight', earned: true, icon: '👑' },
            { id: 4, title: 'Community Leader', description: 'Helped 3+ neighbors start harvesting', earned: false, icon: '🌟' },
            { id: 5, title: 'Monsoon Master', description: 'Maximized collection during monsoon', earned: true, icon: '🌧️' }
          ]
        });
        
        setLeaderboard({
          neighbors: [
            { id: 1, name: 'Sarah Johnson', score: 95, waterSaved: 15000, rank: 1, avatar: '👩‍🌾' },
            { id: 2, name: 'Mike Chen', score: 88, waterSaved: 12500, rank: 2, avatar: '👨‍💼' },
            { id: 3, name: 'You', score: 82, waterSaved: 11200, rank: 3, avatar: '🏠' },
            { id: 4, name: 'Emma Davis', score: 78, waterSaved: 9800, rank: 4, avatar: '👩‍🎓' },
            { id: 5, name: 'Carlos Rodriguez', score: 75, waterSaved: 9200, rank: 5, avatar: '👨‍🔧' }
          ],
          userPosition: 3,
          totalParticipants: 8
        });

        setShareMessages({
          whatsapp: '🌧️ I\'m making a difference with rainwater harvesting! 💧\n\n✅ Saved 11,200 liters this year\n🏆 Ranked #3 in my neighborhood\n🌱 Score: 82/100\n\nJoin me in conserving water for a sustainable future! 🌍',
          twitter: '🌧️ Proud to share my rainwater harvesting impact! 💧\n\n✅ 11,200L saved this year\n🏆 #3 in neighborhood\n🌱 82/100 sustainability score\n\nEvery drop counts! Join the movement 🌍',
          linkedin: 'I\'m excited to share my progress in sustainable water management through rooftop rainwater harvesting!'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = impact?.months.map((month, index) => ({
    month,
    community: impact.communityData[index],
    individual: impact.individualData[index],
    rainfall: impact.rainfallData[index]
  })) || [];

  const scoreData = [
    { name: 'Your Score', value: impact?.userScore || 0, fill: '#10b981' },
    { name: 'Remaining', value: 100 - (impact?.userScore || 0), fill: '#e5e7eb' }
  ];

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-amber-800';
    return 'bg-gradient-to-r from-blue-400 to-blue-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-600" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-600" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <Target className="w-6 h-6 text-blue-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eeeeee] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eeeeee]">
      <Container maxWidth="xl" className="py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
            <Droplets className="w-9 h-9 text-blue-600 animate-bounce" />
            Community Impact Dashboard
            <Leaf className="w-9 h-9 text-green-600 animate-pulse" />
          </h1>
          <p className="text-lg text-gray-600">Track your water conservation journey and compete with neighbors!</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white transform hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Your Score</p>
                  <p className="text-2xl font-bold">{impact?.userScore}/100</p>
                </div>
                <TrendingUp className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white transform hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Your Rank</p>
                  <p className="text-2xl font-bold">#{impact?.userRank}</p>
                </div>
                {getRankIcon(impact?.userRank || 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white transform hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Water Saved</p>
                  <p className="text-xl font-bold">{impact?.totalIndividualWater.toLocaleString()}L</p>
                </div>
                <Droplets className="w-10 h-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white transform hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Participants</p>
                  <p className="text-2xl font-bold">{impact?.totalParticipants}</p>
                </div>
                <Users className="w-10 h-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Water Collection Chart */}
          <Card className="p-6">
            <Typography variant="h6" className="mb-4 font-semibold text-gray-800">
              Monthly Water Collection
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`${value.toLocaleString()}L`, '']} />
                <Bar dataKey="community" fill="#3b82f6" name="Community" />
                <Bar dataKey="individual" fill="#10b981" name="Your Collection" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Score Visualization */}
          <Card className="p-6">
            <Typography variant="h6" className="mb-4 font-semibold text-gray-800">
              Your Sustainability Score
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={scoreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {scoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <p className="text-2xl font-bold text-green-600">{impact?.userScore}%</p>
              <p className="text-gray-600">Sustainability Score</p>
            </div>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-8 h-8 text-yellow-600" />
              <Typography variant="h5" className="font-bold text-gray-800">
                Neighborhood Leaderboard
              </Typography>
            </div>
            <div className="space-y-4">
              {leaderboard?.neighbors.map((neighbor) => (
                <div
                  key={neighbor.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    neighbor.name === 'You' ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                  } hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getRankColor(neighbor.rank)}`}>
                      {neighbor.rank}
                    </div>
                    <div className="text-xl">{neighbor.avatar}</div>
                    <div>
                      <p className="font-semibold text-gray-800">{neighbor.name}</p>
                      <p className="text-xs text-gray-600">{neighbor.waterSaved.toLocaleString()}L saved</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">{neighbor.score}</p>
                    <p className="text-sm text-gray-600">points</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Water Savings Equivalents */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <Typography variant="h5" className="mb-6 font-bold text-gray-800 flex items-center gap-3">
              <Zap className="w-8 h-8 text-yellow-600" />
              Your Impact Equivalents
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl mb-2">🏊‍♂️</div>
                <p className="text-xl font-bold text-blue-600">{impact?.equivalents.olympicPools}</p>
                <p className="text-sm text-gray-600">Olympic Swimming Pools</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl mb-2">🏠</div>
                <p className="text-xl font-bold text-green-600">{impact?.equivalents.households}</p>
                <p className="text-sm text-gray-600">Households Supplied</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-3xl mb-2">🌳</div>
                <p className="text-xl font-bold text-yellow-600">{impact?.equivalents.trees}</p>
                <p className="text-sm text-gray-600">Trees Watered</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl mb-2">🌍</div>
                <p className="text-xl font-bold text-purple-600">{impact?.equivalents.carbonOffset}</p>
                <p className="text-sm text-gray-600">kg CO₂ Offset</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <Typography variant="h5" className="mb-6 font-bold text-gray-800 flex items-center gap-3">
              <Award className="w-8 h-8 text-purple-600" />
              Achievements
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {impact?.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    achievement.earned
                      ? 'bg-green-50 border-green-200 shadow-md'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{achievement.icon}</span>
                    <h3 className="font-semibold text-gray-800">{achievement.title}</h3>
                    {achievement.earned && (
                      <Chip label="Earned" size="small" className="bg-green-500 text-white" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Social Sharing */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Typography variant="h5" className="font-bold text-gray-800 flex items-center gap-3">
                <Share2 className="w-8 h-8 text-blue-600" />
                Share Your Impact
              </Typography>
              <Button
                variant="contained"
                onClick={() => setShareDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
                startIcon={<Share2 className="w-4 h-4" />}
              >
                Share Now
              </Button>
            </div>
            <p className="text-gray-600">
              Inspire others to join the rainwater harvesting movement by sharing your achievements!
            </p>
          </CardContent>
        </Card>

        {/* Share Dialog */}
        <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle className="text-center font-bold">Share Your Water Conservation Journey</DialogTitle>
          <DialogContent>
            <div className="space-y-4 py-4">
              <div className="flex justify-center gap-4">
                <WhatsappShareButton
                  url="https://rainwater-harvesting.com"
                  title={shareMessages?.whatsapp}
                  className="transform hover:scale-110 transition-transform"
                >
                  <WhatsappIcon size={48} round />
                </WhatsappShareButton>
                
                <TwitterShareButton
                  url="https://rainwater-harvesting.com"
                  title={shareMessages?.twitter}
                  className="transform hover:scale-110 transition-transform"
                >
                  <TwitterIcon size={48} round />
                </TwitterShareButton>
                
                <LinkedinShareButton
                  url="https://rainwater-harvesting.com"
                  title={shareMessages?.linkedin}
                  className="transform hover:scale-110 transition-transform"
                >
                  <LinkedinIcon size={48} round />
                </LinkedinShareButton>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 font-medium mb-2">Preview Message:</p>
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {shareMessages?.whatsapp}
                </p>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  );
};

export default CommunityImpactDashboard;
