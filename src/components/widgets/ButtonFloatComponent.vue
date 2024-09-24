<template>
  <!-- Contenedor para los botones -->
  <div class="btn-container">
    <!-- Botón de inicio -->
    <router-link :to="{ name: 'actividades' }" class="btn-link">
      <button class="btn btn-success btn-float">
        <i class="fas fa-home"></i> <!-- Ícono de Font Awesome -->
      </button>
    </router-link>

    <!-- Botón de retroceso -->
    <button class="btn btn-warning btn-float btn-back" @click="goBack">
      <i class="fas fa-arrow-left"></i> <!-- Ícono de Font Awesome -->
    </button>

    <!-- Botón de avance -->
    <button class="btn btn-info btn-float btn-forward" @click="goForward">
      <i class="fas fa-arrow-right"></i> <!-- Ícono de Font Awesome -->
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.go(-1); // Navega a la página anterior
};

const goForward = () => {
  router.go(1); // Navega a la siguiente página en el historial
};
</script>

<style scoped>
.btn-container {
  position: relative; /* Cambiado a 'relative' para posicionar el contenedor en el flujo normal del documento */
  display: flex; /* Usa Flexbox para la disposición en fila */
  flex-direction: row; /* Coloca los botones en fila */
  gap: 8px; /* Espacio entre los botones */
  margin: 10px; /* Ajusta el margen según sea necesario */
}

.btn-link {
  display: flex; /* Flexbox para centrar el contenido dentro del enlace */
}

.btn-float {
  border-radius: 50%; /* Bordes redondeados para hacer un círculo */
  width: 40px; /* Ancho del botón */
  height: 40px; /* Alto del botón */
  display: flex; /* Flexbox para centrar el texto dentro del botón */
  align-items: center; /* Alineación vertical del texto */
  justify-content: center; /* Alineación horizontal del texto */
  font-size: 25px; /* Tamaño del texto */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Sombra del botón */
  cursor: pointer; /* Cursor en forma de mano */
  transition: all 0.3s ease; /* Transición suave para el color de fondo */
  border: 2px solid #fff; /* Borde blanco */
}

.btn-float:hover {
  background-color: #fff; /* Color de fondo al pasar el ratón */
  color: #333; /* Color del ícono al pasar el ratón */
  border: 2px solid #333; /* Borde oscuro al pasar el ratón */
}

.btn-back {
  background-color: #9c3e32; /* Color de fondo para el botón de retroceso */
  color: #fff; /* Color del ícono */
}

.btn-forward {
  background-color: #14517a; /* Color de fondo para el botón de avance */
  color: #fff; /* Color del ícono */
}

.btn-back:hover {
  background-color: #fff; /* Color de fondo al pasar el ratón para el botón de retroceso */
  color: #9c3e32; /* Color del ícono al pasar el ratón */
}

.btn-forward:hover {
  background-color: #fff; /* Color de fondo al pasar el ratón para el botón de avance */
  color: #3498db; /* Color del ícono al pasar el ratón */
}
</style>
