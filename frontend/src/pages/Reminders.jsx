import React, { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Calendar,
  AlertTriangle,
  RotateCw
} from 'lucide-react';
import { api } from '../services/api';
import Modal from '../components/Modal';

export const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const data = await api.getReminders();
      setReminders(data.reminders || []);
    } catch (err) {
      console.error('Failed to load reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleToggle = async (id) => {
    try {
      await api.toggleReminder(id);
      fetchReminders();
    } catch (err) {
      console.error('Failed to toggle reminder:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteReminder(id);
      fetchReminders();
    } catch (err) {
      console.error('Failed to delete reminder:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !reminderDate) return;
    setCreating(true);
    try {
      await api.createReminder({
        title,
        reminder_date: new Date(reminderDate).toISOString(),
        notes
      });
      setIsCreateModalOpen(false);
      setTitle('');
      setReminderDate('');
      setNotes('');
      fetchReminders();
    } catch (err) {
      console.error('Failed to create reminder:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleTriggerScan = async () => {
    setScanning(true);
    try {
      await api.triggerDeadlineScan();
      alert('Deadline scan complete! Check notifications dropdown for newly flagged deadlines.');
    } catch (err) {
      console.error('Failed to trigger scan:', err);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-red-700" />
            My Reminders & Deadlines
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Never miss an application deadline, follow-up date, or interview screening.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerScan}
            disabled={scanning}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            <span>Scan Deadlines</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-700 hover:bg-red-800 flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Set Reminder</span>
          </button>
        </div>
      </div>

      {/* Reminder List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading reminders...</div>
      ) : reminders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No personal reminders set</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Add deadline alerts for your upcoming submissions or interview preparations.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-700 hover:bg-red-800 cursor-pointer shadow-xs"
          >
            Create Your First Reminder
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
          {reminders.map((rem) => {
            const isPast = new Date(rem.reminder_date) < new Date();
            return (
              <div
                key={rem.id}
                className={`p-4 sm:p-5 flex items-start justify-between gap-3 transition-colors ${
                  rem.is_completed ? 'bg-slate-50/50' : 'hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggle(rem.id)}
                    className="mt-0.5 text-slate-400 hover:text-red-700 transition-colors cursor-pointer"
                  >
                    {rem.is_completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <h4
                      className={`text-xs md:text-sm font-semibold ${
                        rem.is_completed ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {rem.title}
                    </h4>

                    {rem.opportunity_title && (
                      <p className="text-[11px] text-red-700 font-medium mt-0.5">
                        Related: {rem.opportunity_title}
                      </p>
                    )}

                    {rem.notes && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {rem.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(rem.reminder_date).toLocaleString('en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {isPast && !rem.is_completed && (
                        <span className="text-rose-600 font-semibold">(Overdue)</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(rem.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Delete reminder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Reminder Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Set Academic Reminder"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reminder Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Finalize Resume for Google Summer Internship"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reminder Date & Time *
            </label>
            <input
              type="datetime-local"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Personal Preparation Checklist / Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Review LeetCode Medium dynamic programming and tree traversal problems."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-red-700 hover:bg-red-800 cursor-pointer disabled:opacity-50"
            >
              {creating ? 'Saving...' : 'Set Reminder'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Reminders;
