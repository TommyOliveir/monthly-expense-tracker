export const ENDPOINTS = {
  auth: {
    signup: "/auth/signup",
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
  },
  posts: {
    list: "/posts",
    slug: "/posts/slug/",
    create: "/posts",
    update: (id: string) => `/posts/${id}`,
    delete: (id: string) => `/posts/${id}`,
    uploadImage: "/upload/image",
    mine: "/posts/mine",
  },
  categories: {
    list: "/categories",
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
