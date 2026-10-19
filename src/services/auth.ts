import { User, UserRole } from '../types';
import { storage } from './storage';

// Local storage keys for auth session and simulated passwords
const AUTH_USER_KEY = 'problos_auth_user_session';
const PASSWORDS_KEY = 'problos_user_passwords';

// Default initial passwords for seeded users
const DEFAULT_PASSWORDS: Record<string, string> = {
  'msiyab10492@gmail.com': 'Admin@12345',
  'rauf@problos.com': 'Rauf@12345',
  'alex.chen@problos.dev': 'Intern@12345',
  'sarah.jenkins@problos.dev': 'Intern@12345',
  'david.okafor@problos.dev': 'TempPass2026!',
};

class AuthService {
  private getPasswords(): Record<string, string> {
    try {
      const stored = localStorage.getItem(PASSWORDS_KEY);
      if (!stored) {
        localStorage.setItem(PASSWORDS_KEY, JSON.stringify(DEFAULT_PASSWORDS));
        return { ...DEFAULT_PASSWORDS };
      }
      return JSON.parse(stored);
    } catch {
      return { ...DEFAULT_PASSWORDS };
    }
  }

  private setPassword(email: string, pass: string): void {
    const list = this.getPasswords();
    list[email.toLowerCase().trim()] = pass;
    localStorage.setItem(PASSWORDS_KEY, JSON.stringify(list));
  }

  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (!stored) return null;
      const user = JSON.parse(stored) as User;
      // Refresh user from fresh storage to reflect recent changes (status, courses, etc.)
      const fresh = storage.getUserById(user.id);
      return fresh || user;
    } catch {
      return null;
    }
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  }

  login(email: string, pass: string): { success: boolean; user?: User; error?: string; requirePasswordChange?: boolean } {
    const normalizedEmail = email.toLowerCase().trim();
    const user = storage.getUserByEmail(normalizedEmail);

    if (!user) {
      return { success: false, error: 'No account found with this email address.' };
    }

    if (!user.accountActive) {
      return { success: false, error: 'Your account is currently deactivated. Please contact an administrator.' };
    }

    const passwords = this.getPasswords();
    const expected = passwords[normalizedEmail] || 'Intern@12345'; // fallback for demo testing

    if (pass !== expected) {
      return { success: false, error: 'Invalid password. Please check your credentials.' };
    }

    // Set logged-in session
    this.setCurrentUser(user);

    if (user.mustChangePassword) {
      return {
        success: true,
        user,
        requirePasswordChange: true,
      };
    }

    return { success: true, user };
  }

  registerLearner(name: string, email: string, pass: string): { success: boolean; user?: User; error?: string } {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = storage.getUserByEmail(normalizedEmail);
    if (existing) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    if (!name || name.trim().length < 2) {
      return { success: false, error: 'Please enter your full name.' };
    }

    if (!pass || pass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    // Public users can ONLY register as learners
    const newUser: User = {
      id: 'usr_reg_' + Date.now(),
      name: name.trim(),
      email: normalizedEmail,
      role: 'learner',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=009166`,
      createdAt: new Date().toISOString(),
      accountActive: true,
      assignedTrackIds: ['trk_web_dev'], // Default starter track
      enrolledCourseIds: ['crs_html_css', 'crs_javascript'],
      mustChangePassword: false,
    };

    storage.saveUser(newUser);
    this.setPassword(normalizedEmail, pass);
    this.setCurrentUser(newUser);

    return { success: true, user: newUser };
  }

  changePassword(userId: string, newPass: string): { success: boolean; error?: string } {
    if (!newPass || newPass.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    const user = storage.getUserById(userId);
    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    this.setPassword(user.email, newPass);
    user.mustChangePassword = false;
    user.temporaryPasswordActive = false;
    storage.saveUser(user);
    this.setCurrentUser(user);

    return { success: true };
  }

  adminSetTemporaryPassword(adminId: string, targetUserId: string, tempPass: string): { success: boolean; error?: string } {
    const admin = storage.getUserById(adminId);
    if (!admin || admin.role !== 'admin') {
      return { success: false, error: 'Unauthorized. Only administrators can issue temporary passwords.' };
    }

    const targetUser = storage.getUserById(targetUserId);
    if (!targetUser) {
      return { success: false, error: 'Target user not found.' };
    }

    this.setPassword(targetUser.email, tempPass);
    targetUser.mustChangePassword = true;
    targetUser.temporaryPasswordActive = true;
    storage.saveUser(targetUser);

    storage.addLog({
      adminId: admin.id,
      adminName: admin.name,
      action: 'Issued Temporary Password',
      details: `Generated temporary password for ${targetUser.name} (${targetUser.email}). Password reset flagged for next login.`,
      targetType: 'intern',
      targetId: targetUser.id,
    });

    return { success: true };
  }

  logout(): void {
    this.setCurrentUser(null);
  }

  isAccessExpired(user: User): boolean {
    if (!user.accessExpiresAt) return false;
    return new Date(user.accessExpiresAt).getTime() < Date.now();
  }

  canAccessCourse(user: User, courseId: string): boolean {
    if (user.role === 'admin') return true;
    if (user.excludedCourseIds?.includes(courseId)) return false;
    if (user.enrolledCourseIds.includes(courseId)) return true;

    // Check if course belongs to an assigned track
    const tracks = storage.getTracks().filter(t => user.assignedTrackIds.includes(t.id));
    return tracks.some(t => t.courseIds.includes(courseId));
  }
}

export const auth = new AuthService();
export { DEFAULT_PASSWORDS };
