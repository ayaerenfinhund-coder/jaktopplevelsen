// Stub auth service for demo - Firebase integration to be added later

export const authService = {
  signIn: async (_email: string, _password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { user: { uid: 'demo', email: _email } };
  },

  register: async (_email: string, _password: string, _name: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { user: { uid: 'demo', email: _email } };
  },

  signOut: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
  },

  getCurrentUser: () => null,
};
