const Document = require('../models/Document');
const Activity = require('../models/Activity');

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Aggregate storage by category
    const categoryStats = await Document.aggregate([
      { $match: { owner: userId, isArchived: false } },
      { $group: { _id: '$category', totalSize: { $sum: '$size' }, count: { $sum: 1 } } }
    ]);

    // Total storage
    const totalStorage = categoryStats.reduce((acc, curr) => acc + curr.totalSize, 0);
    const totalFiles = categoryStats.reduce((acc, curr) => acc + curr.count, 0);

    // Recent activity
    const recentActivity = await Activity.find({ user: userId })
      .populate('document', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        totalStorage,
        totalFiles,
        storageLimit: req.user.storageLimit,
        categoryStats,
        recentActivity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
