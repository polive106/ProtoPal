import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global mock for @acme/i18n — resolves translation keys to English strings
// so that existing text-based test assertions continue to work.
vi.mock('@acme/i18n', () => {
  // Inline the English locale data for the mock
  const commonEn = {
    appName: 'Acme',
    loading: 'Loading...',
    error: 'Something went wrong',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    back: 'Back',
    logout: 'Logout',
    notes: 'Notes',
    nav: { notes: 'Notes' },
    dashboard: {
      welcome: 'Welcome, {{firstName}}!',
      notesTitle: 'Notes',
      notesDescription: 'Manage your notes and ideas.',
      viewNotes: 'View Notes',
    },
  };
  const authEn = {
    login: {
      title: 'Sign In', description: 'Enter your credentials to access your account',
      emailLabel: 'Email', passwordLabel: 'Password',
      placeholder: { email: 'you@example.com' },
      submit: 'Sign In', submitting: 'Signing in...',
      forgotPassword: 'Forgot password?', noAccount: "Don't have an account?", signUp: 'Sign up',
    },
    register: {
      title: 'Create Account', description: 'Sign up for a new account',
      firstNameLabel: 'First Name', lastNameLabel: 'Last Name',
      emailLabel: 'Email', passwordLabel: 'Password',
      passwordHint: 'Min 8 chars, uppercase, lowercase, and number',
      submit: 'Create Account', submitting: 'Creating...',
      hasAccount: 'Already have an account?', signIn: 'Sign in',
    },
    forgotPassword: {
      title: 'Forgot Password', description: "Enter your email and we'll send you a reset link",
      emailLabel: 'Email', placeholder: { email: 'you@example.com' },
      submit: 'Send Reset Link', submitting: 'Sending...',
      rememberPassword: 'Remember your password?', signIn: 'Sign in',
      successTitle: 'Check Your Email',
      successDescription: "If an account with that email exists, we've sent a password reset link.",
      successMessage: "The link will expire in 1 hour. Check your spam folder if you don't see it.",
      backToSignIn: 'Back to Sign In',
    },
    resetPassword: {
      title: 'Reset Password', description: 'Enter your new password',
      passwordLabel: 'New Password',
      passwordHint: 'Min 8 chars, uppercase, lowercase, and number',
      submit: 'Reset Password', submitting: 'Resetting...',
      successTitle: 'Password Reset',
      successMessage: 'Your password has been reset successfully. You can now sign in with your new password.',
      signIn: 'Sign In',
    },
    checkEmail: {
      title: 'Check Your Email',
      description: 'We sent a verification link to <strong>{{email}}</strong>',
      message: "Click the link in the email to verify your account. If you don't see the email, check your spam folder or request a new one.",
      resent: 'Verification email resent successfully.',
      resend: 'Resend Verification Email', resending: 'Sending...',
      resendError: 'Failed to resend email',
      alreadyVerified: 'Already verified?', signIn: 'Sign in',
    },
    verify: {
      loading: 'Verifying your email...',
      failedTitle: 'Verification Failed',
      failedMessage: 'Invalid or expired verification link.',
      registerAgain: 'Register Again',
      hasAccount: 'Already have an account?', signIn: 'Sign in',
      successTitle: 'Email Verified',
      successMessage: 'Your email has been verified. You can now sign in.',
      signInButton: 'Sign In',
    },
  };
  const notesEn = {
    pageTitle: 'Notes', newNote: 'New Note',
    drawer: {
      newTitle: 'New Note', editTitle: 'Edit Note',
      newDescription: 'Fill in the details to create a new note.',
      editDescription: 'Update the note details below.',
      titleLabel: 'Title', contentLabel: 'Content', cancel: 'Cancel',
      save: { create: 'Create', update: 'Update', saving: 'Saving...' },
    },
    empty: { title: 'No notes yet', description: 'Create your first note to get started.', createButton: 'Create Note' },
    card: { edit: 'Edit', delete: 'Delete' },
  };

  const resources: Record<string, Record<string, unknown>> = { common: commonEn, auth: authEn, notes: notesEn };

  function resolveKey(obj: unknown, path: string): string {
    const parts = path.split('.');
    let current: unknown = obj;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return path;
      }
    }
    return typeof current === 'string' ? current : path;
  }

  function createT(defaultNs: string) {
    return (key: string, opts?: Record<string, unknown>) => {
      let nsToUse = defaultNs;
      let keyToUse = key;
      if (key.includes(':')) {
        const [ns, rest] = key.split(':');
        nsToUse = ns!;
        keyToUse = rest!;
      }
      const nsResource = resources[nsToUse];
      if (!nsResource) return key;
      let result = resolveKey(nsResource, keyToUse);
      if (opts) {
        for (const [k, v] of Object.entries(opts)) {
          if (k === 'ns') continue;
          result = result.replace(`{{${k}}}`, String(v));
        }
      }
      return result;
    };
  }

  return {
    useTranslation: (ns?: string) => ({
      t: createT(ns ?? 'common'),
      i18n: { language: 'en', changeLanguage: vi.fn() },
    }),
    Trans: ({ children }: { children: React.ReactNode }) => children,
    I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
    default: {},
  };
});
