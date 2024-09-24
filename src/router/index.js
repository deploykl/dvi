import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/login/LoginView.vue';

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView,
    meta: {
      title: 'Login',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('auth_token');

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'HOME' });
  } else {
    next();
  }
});

export default router
