<template>
  <div class="container">
    <div class="d-flex justify-content-center align-items-center min-vh-100">
      <div class="login-box">
        <div class="card shadow-lg p-4" style="max-width: 600px; width: 100%;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <img src="@/assets/img/login/logo.png" alt="Imagen" class="img-fluid" />
            </div>

            <div v-if="errorMessage" class="alert alert-danger text-center mb-4" role="alert">
              {{ errorMessage }}
            </div>

            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label for="username" class="form-label">Nombre de usuario</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="fas fa-user"></i>
                  </span>
                  <input type="text" id="username" v-model="username" @input="handleUsernameInput" class="form-control" placeholder="Usuario" required />
                </div>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Contraseña</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="fas fa-lock"></i>
                  </span>
                  <input type="password" id="password" v-model="password" class="form-control" placeholder="Contraseña" required />
                </div>
              </div>
              <div class="text-center">
                <button type="submit" class="btn btn-success btn-lg">
                  <i class="fas fa-sign-in-alt"></i> Ingresar
                </button>
              </div>
            </form>
          </div>
          <div class="card-footer border-top text-center">
            <small>Aplicativo DVI v.0.1</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../components/axios'
import { toLowerCase } from '@/assets/js/validation.js'

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const router = useRouter()

// Maneja la entrada del nombre de usuario
const handleUsernameInput = (event) => {
  username.value = toLowerCase(event.target.value)
}

const handleSubmit = async () => {
  try {
    const response = await api.post('user/login/', {
      username: username.value,
      password: password.value,
    });

    console.log('Respuesta del backend:', response.data);

    const { access, refresh, is_superuser, is_staff, group } = response.data;

    if (access) {
      localStorage.setItem('auth_token', access);
    } else {
      errorMessage.value = 'No se recibió token de acceso.';
      return;
    }

    if (refresh) {
      localStorage.setItem('refreshToken', refresh);
    } else {
      errorMessage.value = 'No se recibió token de refresco.';
      return;
    }

    localStorage.setItem('is_superuser', is_superuser ? 'true' : 'false');
    localStorage.setItem('is_staff', is_staff ? 'true' : 'false');
    localStorage.setItem('group', group || 'No definido');

    console.log('Grupo del usuario:', group || 'No definido');

    // Verificar permisos del usuario
    if (is_superuser || (group && group !== 'No definido')) {
      router.push('/home');
    } else {
      errorMessage.value = 'No tiene grupo asociado con la actividad.';
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.detail) {
      errorMessage.value = error.response.data.detail;
    } else {
      errorMessage.value = 'Servidor deshabilitado. Por favor contactar con el ingeniero de sistemas.';
    }
    console.error('Error:', error);
  }
}
</script>

<style scoped>
.container {
  background-color: #f8f9fa; /* Fondo claro */
}

.login-box {
  background-color: #ffffff; /* Fondo blanco para la caja de login */
  border-radius: 10px; /* Bordes redondeados */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* Sombra sutil */
}

.card {
  border: none; /* Sin borde para la tarjeta */
}

.card-footer {
  border-top: 5px solid #1a7529; /* Borde superior verde */
  background-color: #f1f1f1; /* Fondo gris claro */
}

.input-group-text {
  background-color: #1a7529; /* Color de fondo verde para los iconos */
  color: white; /* Color de los iconos */
}

.btn-success {
  background-color: #28a745; /* Verde más brillante */
  border: none; /* Sin borde */
  transition: background-color 0.3s; /* Transición suave */
}

.btn-success:hover {
  background-color: #218838; /* Color verde más oscuro al pasar el ratón */
}
</style>