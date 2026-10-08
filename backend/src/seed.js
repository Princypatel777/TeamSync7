import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import StudentProfile from './models/StudentProfile.js';
import FacultyProfile from './models/FacultyProfile.js';
import Department from './models/Department.js';
import AcademicYear from './models/AcademicYear.js';
import SGPCycle from './models/SGPCycle.js';
import ProjectGroup from './models/ProjectGroup.js';
import GroupMember from './models/GroupMember.js';
import Project from './models/Project.js';
import Task from './models/Task.js';
import StudentMark from './models/StudentMark.js';
import ProjectFile from './models/ProjectFile.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seed]: Cleaning existing Collections...');

    await User.deleteMany({});
    await StudentProfile.deleteMany({});
    await FacultyProfile.deleteMany({});
    await Department.deleteMany({});
    await AcademicYear.deleteMany({});
    await SGPCycle.deleteMany({});
    await ProjectGroup.deleteMany({});
    await GroupMember.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await StudentMark.deleteMany({});
    await ProjectFile.deleteMany({});

    console.log('[Seed]: Creating seed structure & accounts...');

    // 1. Departments
    const deptIT = await Department.create({
      name: 'Information Technology',
      code: 'IT',
      description: 'Department of Information Technology & Software Engineering',
      isActive: true,
    });
    const deptCSE = await Department.create({
      name: 'Computer Science & Engineering',
      code: 'CSE',
      description: 'Department of Computer Science & Artificial Intelligence',
      isActive: true,
    });
    console.log('✓ Departments created: IT, CSE');

    // 2. Academic Years
    const acadYear = await AcademicYear.create({
      yearLabel: '2025-2026',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2026-06-30'),
      isActive: true,
    });
    console.log('✓ Academic Year created: 2025-2026');

    // 3. SGP Cycles
    const sgpCycle = await SGPCycle.create({
      name: 'SGP-V 2026 (Semester 5 Project)',
      departmentId: deptIT._id,
      academicYearId: acadYear._id,
      startDate: new Date('2026-01-10'),
      endDate: new Date('2026-05-30'),
      isActive: true,
    });
    console.log('✓ SGP Cycle created: SGP-V 2026');

    // 4. Admin Account
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@teamsync.edu',
      passwordHash: 'admin123',
      role: 'ADMIN',
      isActive: true,
    });
    console.log(`✓ Admin created: admin@teamsync.edu / admin123`);

    // 5. Coordinator Account
    const coordUser = await User.create({
      name: 'Prof. Hitesh Patel',
      email: 'coordinator@teamsync.edu',
      passwordHash: 'coord123',
      role: 'COORDINATOR',
      isActive: true,
    });
    await FacultyProfile.create({
      userId: coordUser._id,
      departmentId: deptIT._id,
      designation: 'Associate Professor & SGP Coordinator',
      expertise: ['Cloud Computing', 'Software Architecture'],
    });
    console.log(`✓ Coordinator created: coordinator@teamsync.edu / coord123`);

    // 6. Faculty Account
    const facultyUser = await User.create({
      name: 'Dr. Ananya Sharma',
      email: 'faculty@teamsync.edu',
      passwordHash: 'faculty123',
      role: 'FACULTY',
      isActive: true,
    });
    await FacultyProfile.create({
      userId: facultyUser._id,
      departmentId: deptIT._id,
      designation: 'Assistant Professor & SGP Mentor',
      expertise: ['Artificial Intelligence', 'Data Science', 'Full Stack Development'],
    });
    console.log(`✓ Faculty created: faculty@teamsync.edu / faculty123`);

    // 7. Student 1: 24IT001 - Rahul Sharma
    const student1 = await User.create({
      name: 'Rahul Sharma',
      enrollmentNumber: '24IT001',
      passwordHash: 'student123',
      role: 'STUDENT',
      isActive: true,
    });
    await StudentProfile.create({
      userId: student1._id,
      enrollmentNumber: '24IT001',
      departmentId: deptIT._id,
      semester: 5,
      skills: ['React', 'Node.js', 'MongoDB', 'Express'],
      interests: ['Full-stack Development', 'Cloud Services'],
      bio: 'Enthusiastic full-stack engineer leading Team Alpha.',
    });
    console.log(`✓ Student 1 created: 24IT001 / student123 (Rahul Sharma)`);

    // 8. Student 2: 24IT002 - Priya Verma
    const student2 = await User.create({
      name: 'Priya Verma',
      enrollmentNumber: '24IT002',
      passwordHash: 'student123',
      role: 'STUDENT',
      isActive: true,
    });
    await StudentProfile.create({
      userId: student2._id,
      enrollmentNumber: '24IT002',
      departmentId: deptIT._id,
      semester: 5,
      skills: ['UI/UX Design', 'Tailwind CSS', 'Figma', 'React'],
      interests: ['Frontend Engineering', 'Accessibility'],
      bio: 'Design enthusiast and user interface developer.',
    });
    console.log(`✓ Student 2 created: 24IT002 / student123 (Priya Verma)`);

    // 9. Student 3: 24IT003 - Aarav Patel
    const student3 = await User.create({
      name: 'Aarav Patel',
      enrollmentNumber: '24IT003',
      passwordHash: 'student123',
      role: 'STUDENT',
      isActive: true,
    });
    await StudentProfile.create({
      userId: student3._id,
      enrollmentNumber: '24IT003',
      departmentId: deptIT._id,
      semester: 5,
      skills: ['Node.js', 'Express', 'PostgreSQL', 'Docker', 'Redis'],
      interests: ['Backend Development', 'Distributed Systems'],
      bio: 'Backend specialist focused on high-performance REST APIs.',
    });
    console.log(`✓ Student 3 created: 24IT003 / student123 (Aarav Patel)`);

    // 10. Student 4: 24IT004 - Diya Shah
    const student4 = await User.create({
      name: 'Diya Shah',
      enrollmentNumber: '24IT004',
      passwordHash: 'student123',
      role: 'STUDENT',
      isActive: true,
    });
    await StudentProfile.create({
      userId: student4._id,
      enrollmentNumber: '24IT004',
      departmentId: deptIT._id,
      semester: 5,
      skills: ['Python', 'PyTorch', 'Data Analysis', 'FastAPI'],
      interests: ['Machine Learning', 'Computer Vision'],
      bio: 'Machine learning practitioner working on predictive pipelines.',
    });
    console.log(`✓ Student 4 created: 24IT004 / student123 (Diya Shah)`);

    // 11. Student 5: 24IT005 - Rohan Mehta
    const student5 = await User.create({
      name: 'Rohan Mehta',
      enrollmentNumber: '24IT005',
      passwordHash: 'student123',
      role: 'STUDENT',
      isActive: true,
    });
    await StudentProfile.create({
      userId: student5._id,
      enrollmentNumber: '24IT005',
      departmentId: deptIT._id,
      semester: 5,
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
      interests: ['Frontend Web Architecture', 'State Management'],
      bio: 'Passionate about accessible UI components and modern web apps.',
    });
    console.log(`✓ Student 5 created: 24IT005 / student123 (Rohan Mehta)`);

    // 12. Student 6: 24IT006 - Ananya Joshi
    const student6 = await User.create({
      name: 'Ananya Joshi',
      enrollmentNumber: '24IT006',
      passwordHash: 'student123',
      role: 'STUDENT',
      isActive: true,
    });
    await StudentProfile.create({
      userId: student6._id,
      enrollmentNumber: '24IT006',
      departmentId: deptIT._id,
      semester: 5,
      skills: ['Cybersecurity', 'Linux', 'Network Security', 'Python'],
      interests: ['Application Security', 'DevSecOps'],
      bio: 'Security researcher interested in application hardening.',
    });
    console.log(`✓ Student 6 created: 24IT006 / student123 (Ananya Joshi)`);

    // 13. Student 7: 24IT007 - Harsh Desai
    const student7 = await User.create({
      name: 'Harsh Desai',
      enrollmentNumber: '24IT007',
      passwordHash: 'student123',
      role: 'STUDENT',
      isActive: true,
    });
    await StudentProfile.create({
      userId: student7._id,
      enrollmentNumber: '24IT007',
      departmentId: deptIT._id,
      semester: 5,
      skills: ['Flutter', 'Dart', 'Firebase', 'Mobile Architecture'],
      interests: ['Cross-Platform Mobile Apps', 'Cloud Integrations'],
      bio: 'Mobile application engineer building intuitive mobile solutions.',
    });
    console.log(`✓ Student 7 created: 24IT007 / student123 (Harsh Desai)`);

    // 14. Project Group 1 (Rahul Sharma + Priya Verma, guided by Dr. Ananya Sharma)
    const group1 = await ProjectGroup.create({
      name: 'Team Alpha Innovators',
      code: 'GRP-2026-IT01',
      departmentId: deptIT._id,
      sgpCycleId: sgpCycle._id,
      leaderId: student1._id,
      guideId: facultyUser._id,
      status: 'ACTIVE',
      groupNumber: 1,
    });

    await GroupMember.create({
      groupId: group1._id,
      userId: student1._id,
      role: 'LEADER',
      status: 'ACCEPTED',
    });
    await GroupMember.create({
      groupId: group1._id,
      userId: student2._id,
      role: 'MEMBER',
      status: 'ACCEPTED',
    });

    const project1 = await Project.create({
      groupId: group1._id,
      sgpCycleId: sgpCycle._id,
      departmentId: deptIT._id,
      facultyGuideId: facultyUser._id,
      title: 'Automated Clinical Decision Support & Imaging Analysis',
      projectKey: 'ACDS',
      description: 'Deep-learning assisted radiology scan analyzer providing heatmap bounding boxes and preliminary diagnostic triage.',
      status: 'APPROVED',
    });

    // Seed tasks for Group 1
    await Task.create([
      {
        projectId: project1._id,
        taskKey: 'ACDS-001',
        taskNumber: 1,
        title: 'Design DICOM Tensor Pipeline & Architecture',
        description: 'Set up image ingestion pipeline and preprocessing models.',
        reporterId: student1._id,
        assigneeId: student1._id,
        priority: 'HIGH',
        status: 'DONE',
        dueDate: new Date(Date.now() + 7 * 86400000),
      },
      {
        projectId: project1._id,
        taskKey: 'ACDS-002',
        taskNumber: 2,
        title: 'Build Radiology Scan Heatmap Viewer Component',
        description: 'Interactive canvas overlays showing inference heatmaps.',
        reporterId: student1._id,
        assigneeId: student2._id,
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        dueDate: new Date(Date.now() + 10 * 86400000),
      },
      {
        projectId: project1._id,
        taskKey: 'ACDS-003',
        taskNumber: 3,
        title: 'Implement Multi-Class Lesion Classification Model',
        description: 'Train ResNet-50 backbone on verified pathology datasets.',
        reporterId: student1._id,
        assigneeId: student1._id,
        priority: 'HIGH',
        status: 'TO_DO',
        dueDate: new Date(Date.now() + 14 * 86400000),
      },
    ]);

    // Seed evaluation marks for Group 1
    await StudentMark.create({
      projectId: project1._id,
      studentId: student1._id,
      evaluatorId: facultyUser._id,
      reviewStage: 'REVIEW_1',
      criteriaScores: [
        { criteriaName: 'Project Progress', weightagePercentage: 25, marksObtained: 23, maxMarks: 25 },
        { criteriaName: 'Technical Contribution', weightagePercentage: 25, marksObtained: 24, maxMarks: 25 },
        { criteriaName: 'Code Quality & Documentation', weightagePercentage: 25, marksObtained: 21, maxMarks: 25 },
        { criteriaName: 'Presentation & Teamwork', weightagePercentage: 25, marksObtained: 22, maxMarks: 25 },
      ],
      totalMarksObtained: 90,
      grade: 'A+',
      feedback: 'Outstanding technical architecture and DICOM pipeline implementation. Model metrics are well documented.',
    });

    // 15. Project Group 2 (Aarav Patel + Diya Shah + Rohan Mehta, guided by Dr. Ananya Sharma)
    const group2 = await ProjectGroup.create({
      name: 'NextGen IoT Solutions',
      code: 'GRP-2026-IT02',
      departmentId: deptIT._id,
      sgpCycleId: sgpCycle._id,
      leaderId: student3._id,
      guideId: facultyUser._id,
      status: 'ACTIVE',
      groupNumber: 2,
    });

    await GroupMember.create({
      groupId: group2._id,
      userId: student3._id,
      role: 'LEADER',
      status: 'ACCEPTED',
    });
    await GroupMember.create({
      groupId: group2._id,
      userId: student4._id,
      role: 'MEMBER',
      status: 'ACCEPTED',
    });
    await GroupMember.create({
      groupId: group2._id,
      userId: student5._id,
      role: 'MEMBER',
      status: 'ACCEPTED',
    });

    const project2 = await Project.create({
      groupId: group2._id,
      sgpCycleId: sgpCycle._id,
      departmentId: deptIT._id,
      facultyGuideId: facultyUser._id,
      title: 'Smart Campus IoT Asset Tracking & Predictive Maintenance',
      projectKey: 'SCAT',
      description: 'Distributed MQTT sensor grid and predictive failure detection for laboratory instrumentation.',
      status: 'APPROVED',
    });

    await Task.create([
      {
        projectId: project2._id,
        taskKey: 'SCAT-001',
        taskNumber: 1,
        title: 'Telemetry Ingestion & Timescale Database Setup',
        description: 'High-throughput MQTT broker integration with time-series persistence.',
        reporterId: student3._id,
        assigneeId: student3._id,
        priority: 'HIGH',
        status: 'DONE',
        dueDate: new Date(Date.now() + 5 * 86400000),
      },
      {
        projectId: project2._id,
        taskKey: 'SCAT-002',
        taskNumber: 2,
        title: 'Anomaly Detection Classifier on Vibration Data',
        description: 'Random forest and LSTM anomaly identification on motor sensor streams.',
        reporterId: student3._id,
        assigneeId: student4._id,
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        dueDate: new Date(Date.now() + 12 * 86400000),
      },
      {
        projectId: project2._id,
        taskKey: 'SCAT-003',
        taskNumber: 3,
        title: 'Real-time Hardware Status Telemetry Dashboard',
        description: 'WebSocket-driven telemetry visualization with threshold alerts.',
        reporterId: student3._id,
        assigneeId: student5._id,
        priority: 'MEDIUM',
        status: 'TO_DO',
        dueDate: new Date(Date.now() + 15 * 86400000),
      },
    ]);

    console.log('✓ Project Groups 1 & 2 populated with members, projects, tasks, and evaluation marks!');

    console.log('\n[Seed Success]: Database populated with complete academic structure and 7 student demo accounts!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
