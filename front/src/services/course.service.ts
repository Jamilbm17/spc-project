import { api, studentApi } from '@/lib/api'

export interface CourseTeacher {
    id: number
    name: string
    email: string
    role: string
}

export type QuestionType = 'OPEN_TEXT' | 'MULTIPLE_CHOICE' | 'POLL'

export interface Question {
    id: number
    postId: number
    text: string
    type: QuestionType
    options: string[] | null
    correctOptionIndex: number | null
    points: number | null
    order: number
}

export interface Post {
    id: number
    courseId: number | null
    activityId: number | null
    title: string
    content: string
    imageUrl?: string
    dueDate?: string | null
    maxScore?: number | null
    createdAt: string
    questions?: Question[]
}

export interface Course {
    id: number
    title: string
    description?: string
    imageUrl?: string
    isActive: boolean
    teacherId: number
    teacher: CourseTeacher
    createdAt: string
    updatedAt: string
    enrollmentCount?: number
    posts?: Post[]
}

export interface CourseEnrollment {
    id: number
    studentId: number
    courseId: number
    course: Course
    enrolledAt: string
}

export interface StudentAnswer {
    id: number
    questionId: number
    question: Question
    textAnswer: string | null
    selectedOption: number | null
}

export interface TaskSubmission {
    id: number
    postId: number
    studentId: number
    student?: { id: number; firstName: string; lastName: string; email: string }
    submittedAt: string
    updatedAt: string
    score: number | null
    teacherComment: string | null
    answers: StudentAnswer[]
}

// ── Admin API ──────────────────────────────────────────────────────────────

export const courseAdminService = {
    findAll: (query?: string): Promise<Course[]> =>
        api.get('/courses/admin', { params: { query } }),

    findOne: (id: number): Promise<Course & { posts: Post[]; enrollmentCount: number }> =>
        api.get(`/courses/${id}`),

    create: (data: { title: string; description?: string; imageUrl?: string }): Promise<Course> =>
        api.post('/courses', data),

    update: (id: number, data: Partial<Course>): Promise<Course> =>
        api.put(`/courses/${id}`, data),

    remove: (id: number): Promise<void> =>
        api.delete(`/courses/${id}`),

    createPost: (courseId: number, data: Partial<Post>): Promise<Post> =>
        api.post(`/courses/${courseId}/posts`, data),

    updatePost: (postId: number, data: Partial<Post>): Promise<Post> =>
        api.put(`/courses/posts/${postId}`, data),

    removePost: (courseId: number, postId: number): Promise<void> =>
        api.delete(`/courses/${courseId}/posts/${postId}`),

    findEnrollments: (courseId: number): Promise<CourseEnrollment[]> =>
        api.get(`/courses/${courseId}/students`),

    // Activity tasks
    findActivityPosts: (activityId: number): Promise<Post[]> =>
        api.get(`/courses/activity-tasks/${activityId}`),

    createActivityPost: (activityId: number, data: Partial<Post>): Promise<Post> =>
        api.post(`/courses/activity-tasks/${activityId}`, data),

    removeActivityPost: (postId: number): Promise<void> =>
        api.delete(`/courses/0/posts/${postId}`),

    // Post detail with questions
    findPostWithQuestions: (postId: number): Promise<Post & { questions: Question[] }> =>
        api.get(`/courses/posts/${postId}`),

    // Questions CRUD
    createQuestion: (postId: number, data: Omit<Question, 'id' | 'postId'>): Promise<Question> =>
        api.post(`/courses/posts/${postId}/questions`, data),

    updateQuestion: (questionId: number, data: Omit<Question, 'id' | 'postId'>): Promise<Question> =>
        api.put(`/courses/questions/${questionId}`, data),

    removeQuestion: (questionId: number): Promise<void> =>
        api.delete(`/courses/questions/${questionId}`),

    // Submissions (admin)
    getSubmissions: (postId: number): Promise<TaskSubmission[]> =>
        api.get(`/courses/posts/${postId}/submissions`),

    gradeSubmission: (submissionId: number, data: { score: number; teacherComment?: string }): Promise<TaskSubmission> =>
        api.put(`/courses/submissions/${submissionId}/grade`, data),
}

// ── Student API ────────────────────────────────────────────────────────────

export const courseStudentService = {
    findAll: (query?: string): Promise<Course[]> =>
        studentApi.get('/courses', { params: { query } }),

    findOne: (id: number): Promise<Course & { posts: Post[]; enrollmentCount: number }> =>
        studentApi.get(`/courses/${id}`),

    findActivityPosts: (activityId: number): Promise<Post[]> =>
        studentApi.get(`/courses/activity-tasks/${activityId}`),

    findMyCourses: (): Promise<(Course & { posts: Post[] })[]> =>
        studentApi.get('/courses/my'),

    checkEnrollment: (courseId: number): Promise<{ enrolled: boolean }> =>
        studentApi.get(`/courses/${courseId}/check-enrollment`),

    enroll: (courseId: number): Promise<CourseEnrollment> =>
        studentApi.post(`/courses/${courseId}/enroll`, {}),

    unenroll: (courseId: number): Promise<void> =>
        studentApi.delete(`/courses/${courseId}/unenroll`),

    // Post detail with questions
    findPostWithQuestions: (postId: number): Promise<Post & { questions: Question[] }> =>
        studentApi.get(`/courses/posts/${postId}`),

    // Submissions (student)
    submitTask: (postId: number, answers: { questionId: number; textAnswer?: string; selectedOption?: number }[]): Promise<TaskSubmission> =>
        studentApi.post(`/courses/posts/${postId}/submit`, { answers }),

    getMySubmission: (postId: number): Promise<TaskSubmission | null> =>
        studentApi.get(`/courses/posts/${postId}/my-submission`),
}
