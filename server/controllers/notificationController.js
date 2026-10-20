const Notification = require('../models/Notification');
const mockStore = require('../utils/mockStore');

exports.getUserNotifications = async (req, res, next) => {
  try {
    if (global.USE_IN_MEMORY_FALLBACK) {
      const userNotifs = mockStore.notifications.filter(
        (n) => n.user.toString() === req.user._id.toString()
      );
      const unreadCount = userNotifs.filter((n) => !n.read).length;
      return res.status(200).json({ success: true, unreadCount, notifications: userNotifs });
    }

    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      read: false,
    });

    res.status(200).json({ success: true, unreadCount, notifications });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    if (global.USE_IN_MEMORY_FALLBACK) {
      const notif = mockStore.notifications.find(
        (n) => n._id.toString() === req.params.id && n.user.toString() === req.user._id.toString()
      );
      if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
      notif.read = true;
      return res.status(200).json({ success: true, notification: notif });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    if (global.USE_IN_MEMORY_FALLBACK) {
      mockStore.notifications.forEach((n) => {
        if (n.user.toString() === req.user._id.toString()) n.read = true;
      });
      return res.status(200).json({ success: true, message: 'All notifications marked as read' });
    }

    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
