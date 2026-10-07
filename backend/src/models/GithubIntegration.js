import mongoose from 'mongoose';

const githubIntegrationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      unique: true,
    },
    repoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    repoName: {
      type: String,
      default: '',
      trim: true,
    },
    owner: {
      type: String,
      default: '',
      trim: true,
    },
    isConnected: {
      type: Boolean,
      default: false,
    },
    accessToken: {
      type: String,
      default: '',
      select: false, // Hidden by default as per FR-1203
    },
    defaultBranch: {
      type: String,
      default: 'main',
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const GithubIntegration = mongoose.model('GithubIntegration', githubIntegrationSchema);
export default GithubIntegration;
