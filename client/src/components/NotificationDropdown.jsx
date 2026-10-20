import React, { useState, useEffect } from 'react';
import { Bell, Check, Ticket, X } from 'lucide-react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleNotificationClick = (n) => {
    setIsOpen(false);
    navigate('/dashboard');
  };

  return (
    <div className="dropdown">
      <button
        className="btn btn-link text-white-50 p-2 position-relative text-decoration-none shadow-none"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} className={unreadCount > 0 ? 'text-white' : 'text-muted'} />
        {unreadCount > 0 && (
          <span className="position-absolute top-1 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="position-absolute dropdown-menu show end-0 mt-2 p-0 shadow-lg rounded-3"
          style={{
            width: '320px',
            backgroundColor: '#131926',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 1050,
          }}
        >
          <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary border-opacity-25">
            <h6 className="mb-0 text-white fw-bold">Notifications</h6>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="btn btn-sm btn-link text-danger p-0 text-decoration-none small"
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                No notifications right now
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 border-bottom border-secondary border-opacity-10 cursor-pointer d-flex gap-2 align-items-start ${
                    !n.read ? 'bg-black bg-opacity-25' : ''
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="mt-1 p-1 rounded bg-danger bg-opacity-20 text-danger">
                    <Ticket size={14} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="small text-white fw-semibold">{n.title}</span>
                      {!n.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(n._id, e)}
                          title="Mark read"
                          className="btn btn-sm p-0 text-muted hover-white border-0"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-muted small mb-0 mt-1" style={{ fontSize: '0.78rem' }}>
                      {n.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
