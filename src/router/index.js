import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/login/LoginView.vue';
import HomeView from '../views/HomeView.vue';
import NotFoundView from '../views/NotFoundView.vue'; // Componente para 404
import DireccionView from '@/views/viaticos/admin/DireccionView.vue';

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView,
    meta: {
      title: 'Login',
    },
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'DVI',
      requiresAuth: true, // Añadido para requerir autenticación
    },
  },
  {
    path: '/admin/direccion',
    name: 'direccion',
    component: DireccionView,
    meta: {
      title: 'Dirección',
      requiresAuth: true, // Añadido para requerir autenticación
    },
  },
  {
    path: '/:catchAll(.*)',
    name: 'not-found',
    component: NotFoundView,
    meta: {
      title: 'Página no encontrada',
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
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router
