export const ENDPOINTS = {
  auth: {
    signup: "/auth/signup",
    login: "/auth/login",
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
  tags: {
    list: "/tags",
  },
  comments: {
    list: (postId: string) => `/posts/${postId}/comments`,
    create: (postId: string) => `/posts/${postId}/comments`,
    delete: (postId: string, commentId: string) =>
      `/posts/${postId}/comments/${commentId}`,
  },
} as const;
