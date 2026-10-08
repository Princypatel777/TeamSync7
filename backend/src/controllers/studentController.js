import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import GroupMember from '../models/GroupMember.js';
import ProjectGroup from '../models/ProjectGroup.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import StudentMark from '../models/StudentMark.js';
import ReviewMark from '../models/ReviewMark.js';
import ReviewSchedule from '../models/ReviewSchedule.js';
import Review from '../models/Review.js';
import { z } from 'zod';

const updateProfileSchema = z.object({
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  bio: z.string().optional(),
  preferredRoles: z.array(z.string()).optional(),
  githubUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
});

export const getStudentDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Check group membership
    const membership = await GroupMember.findOne({ userId, status: 'ACCEPTED' });

    if (!membership) {
      const unreadNotifications = await Notification.countDocuments({ recipientId: userId, isRead: false });

      return res.status(200).json({
        success: true,
        hasGroup: false,
        group: null,
        project: null,
        mentor: null,
        tasks: { pending: 0, inProgress: 0, completed: 0, dueSoon: 0 },
        notificationsCount: unreadNotifications,
        progress: null,
        deadlines: [],
        latestEvaluation: null,
        activity: [
          { id: 1, text: 'Welcome to TeamSync! Form or join a group in My Group to begin.', type: 'comment', time: 'Just now' }
        ]
      });
    }

    // Fetch Group with leader, guide, department, cycle
    const group = await ProjectGroup.findById(membership.groupId)
      .populate('leaderId', 'name enrollmentNumber email')
      .populate('guideId', 'name email designation')
      .populate('coGuideId', 'name email designation')
      .populate('departmentId', 'name code')
      .populate('sgpCycleId', 'name');

    const membersCount = await GroupMember.countDocuments({ groupId: group._id, status: 'ACCEPTED' });

    // Fetch Active Project
    const project = await Project.findOne({ groupId: group._id }).populate('facultyGuideId', 'name email');

    const mentor = group.guideId || project?.facultyGuideId || group.coGuideId || null;

    let tasksSummary = { pending: 0, inProgress: 0, completed: 0, dueSoon: 0 };
    let groupTasksSummary = { total: 0, completed: 0, pending: 0 };
    let projectProgress = { overall: 0, completedTasks: 0, totalTasks: 0 };
    let deadlines = [];

    if (project) {
      const allProjectTasks = await Task.find({ projectId: project._id });
      const doneGroupTasks = allProjectTasks.filter(t => t.status === 'DONE').length;
      const totalGroupTasks = allProjectTasks.length;
      const progressPercent = totalGroupTasks > 0 ? Math.round((doneGroupTasks / totalGroupTasks) * 100) : 0;

      groupTasksSummary = {
        total: totalGroupTasks,
        completed: doneGroupTasks,
        pending: totalGroupTasks - doneGroupTasks,
      };

      projectProgress = {
        overall: progressPercent,
        completedTasks: doneGroupTasks,
        totalTasks: totalGroupTasks,
      };

      const myTasks = allProjectTasks.filter(t => String(t.assigneeId) === String(userId));
      const pendingMy = myTasks.filter(t => t.status === 'TO_DO' || t.status === 'TODO').length;
      const inProgressMy = myTasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW').length;
      const doneMy = myTasks.filter(t => t.status === 'DONE').length;

      tasksSummary = {
        pending: pendingMy,
        inProgress: inProgressMy,
        completed: doneMy,
        dueSoon: myTasks.filter(t => t.dueDate && new Date(t.dueDate) <= new Date(Date.now() + 86400000 * 3) && t.status !== 'DONE').length,
      };

      // Deadlines from upcoming tasks
      const upcomingTasks = myTasks
        .filter(t => t.status !== 'DONE' && t.dueDate)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 3)
        .map((t) => ({
          id: t._id,
          type: 'TASK',
          title: t.title,
          due: new Date(t.dueDate).toLocaleDateString(),
          urgency: t.priority === 'HIGH' ? 'high' : 'medium',
        }));

      deadlines.push(...upcomingTasks);
    }

    // Deadlines from scheduled reviews
    const upcomingReviews = await ReviewSchedule.find({
      scheduledDate: { $gte: new Date(Date.now() - 86400000) }
    }).sort({ scheduledDate: 1 }).limit(2);

    upcomingReviews.forEach((r) => {
      deadlines.push({
        id: r._id,
        type: 'REVIEW',
        title: r.reviewName || 'SGP Review',
        due: new Date(r.scheduledDate).toLocaleDateString(),
        urgency: 'high',
      });
    });

    // Latest Evaluation / Marks
    let latestEvaluation = null;
    const latestStudentMark = await StudentMark.findOne({ studentId: userId })
      .sort({ createdAt: -1 })
      .populate('evaluatorId', 'name designation email');

    if (latestStudentMark) {
      latestEvaluation = {
        stage: latestStudentMark.reviewStage,
        totalMarks: latestStudentMark.totalMarksObtained,
        grade: latestStudentMark.grade,
        feedback: latestStudentMark.feedback,
        evaluatorName: latestStudentMark.evaluatorId?.name || 'Faculty Guide',
        criteriaScores: latestStudentMark.criteriaScores || [],
        date: latestStudentMark.updatedAt || latestStudentMark.createdAt,
      };
    } else {
      const latestReviewMark = await ReviewMark.findOne({ studentId: userId, status: 'SUBMITTED' })
        .sort({ createdAt: -1 })
        .populate({ path: 'reviewId', match: { marksVisibility: 'VISIBLE' } })
        .populate('facultyId', 'name');

      if (latestReviewMark && latestReviewMark.reviewId) {
        latestEvaluation = {
          stage: latestReviewMark.reviewId.title,
          totalMarks: latestReviewMark.marks,
          maxMarks: latestReviewMark.reviewId.maxMarks,
          grade: latestReviewMark.marks >= 18 ? 'A+' : latestReviewMark.marks >= 15 ? 'A' : 'B',
          feedback: latestReviewMark.feedback,
          evaluatorName: latestReviewMark.facultyId?.name || 'Faculty Guide',
          date: latestReviewMark.updatedAt,
        };
      }
    }

    const unreadNotifications = await Notification.countDocuments({ recipientId: userId, isRead: false });

    res.status(200).json({
      success: true,
      hasGroup: true,
      group: {
        _id: group._id,
        name: group.name,
        code: group.code,
        status: group.status,
        membersCount,
        leader: group.leaderId,
        department: group.departmentId?.name || 'Information Technology',
        sgpCycle: group.sgpCycleId?.name || 'SGP-V',
      },
      mentor: mentor ? {
        _id: mentor._id,
        name: mentor.name,
        email: mentor.email,
        designation: mentor.designation || 'Faculty Guide',
      } : null,
      project: project ? {
        _id: project._id,
        title: project.title,
        status: project.status,
        projectKey: project.projectKey,
        description: project.description,
      } : null,
      tasks: tasksSummary,
      groupTasks: groupTasksSummary,
      notificationsCount: unreadNotifications,
      progress: projectProgress,
      deadlines,
      latestEvaluation,
      activity: [
        { id: 1, text: `Active member in group ${group.name || group.code}`, type: 'feature', time: 'Recently' },
      ],
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentProfile = async (req, res, next) => {
  try {
    const user = req.user;
    let profile = await StudentProfile.findOne({ userId: user._id }).populate('departmentId', 'name code');

    if (!profile) {
      profile = await StudentProfile.create({
        userId: user._id,
        enrollmentNumber: user.enrollmentNumber || 'UNKNOWN',
      });
    }

    res.status(200).json({
      success: true,
      user: user.toJSON(),
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudentProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const validated = updateProfileSchema.parse(req.body);

    const profile = await StudentProfile.findOneAndUpdate(
      { userId: user._id },
      {
        ...(validated.skills && { skills: validated.skills }),
        ...(validated.interests && { interests: validated.interests }),
        ...(validated.bio !== undefined && { bio: validated.bio }),
        ...(validated.preferredRoles && { preferredRoles: validated.preferredRoles }),
        ...(validated.githubUrl !== undefined && { githubUrl: validated.githubUrl }),
        ...(validated.linkedinUrl !== undefined && { linkedinUrl: validated.linkedinUrl }),
        ...(validated.portfolioUrl !== undefined && { portfolioUrl: validated.portfolioUrl }),
      },
      { new: true, upsert: true }
    ).populate('departmentId', 'name code');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile,
    });
  } catch (error) {
    next(error);
  }
};
