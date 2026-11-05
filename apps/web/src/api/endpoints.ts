export const ENDPOINTS = {
  auth: {
    signup: "/auth/signup",
    login: "/auth/login",
    google: "/auth/google",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
  },
  budget: {
    summary: "/budget/summary",
    set: "/budget",
  },
  categories: {
    list: "/category",
    create: "/category",
    update: (id: string) => `/category/${id}`,
    delete: (id: string) => `/category/delete/${id}`,
  },
  expenses: {
    list: "/expense",
    create: "/expense",
    update: (id: string) => `/expense/${id}`,
    delete: (id: string) => `/expense/${id}`,
  },
  comments: {
    list: (postId: string) => `/posts/${postId}/comments`,
    create: (postId: string) => `/posts/${postId}/comments`,
    delete: (postId: string, commentId: string) =>
      `/posts/${postId}/comments/${commentId}`,
  },
} as const;
