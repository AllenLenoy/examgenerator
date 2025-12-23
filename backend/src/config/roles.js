import { ROLES } from './constants.js';

/**
 * Role configuration and utilities
 */
export const roleConfig = {
    [ROLES.ADMIN]: {
        permissions: ['manage_users', 'view_all_exams', 'view_all_attempts', 'manage_system'],
        description: 'Full system access'
    },
    [ROLES.TEACHER]: {
        permissions: ['create_questions', 'create_exams', 'view_students', 'view_student_attempts'],
        description: 'Can create exams and view student performance'
    },
    [ROLES.STUDENT]: {
        permissions: ['take_exams', 'view_own_attempts'],
        description: 'Can take exams and view own results'
    }
};

/**
 * Check if role is valid
 */
export const isValidRole = (role) => {
    return Object.values(ROLES).includes(role);
};

/**
 * Get role permissions
 */
export const getRolePermissions = (role) => {
    return roleConfig[role]?.permissions || [];
};

export default {
    roleConfig,
    isValidRole,
    getRolePermissions
};
