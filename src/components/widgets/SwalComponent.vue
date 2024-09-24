<template>
  <!-- Este template puede estar vacío si no necesitas renderizar nada aquí -->
</template>

<script>
import Swal from 'sweetalert2';

// Función para mostrar una alerta de éxito
export const SwalSuccess = async () => {
  await Swal.fire({
    title: 'Elemento Agregado!',
    text: 'Ha sido agregado correctamente.',
    icon: 'success',
    timer: 1000, // Duración de 1 segundo
    showConfirmButton: false,
    timerProgressBar: true,
    customClass: {
      container: 'swal2-custom-success',
      popup: 'swal2-custom-success',
      header: 'swal2-custom-success',
      title: 'swal2-custom-success',
      htmlContainer: 'swal2-custom-success',
      confirmButton: 'swal2-custom-success'
    }
  });
};

export const SwalUpdate = async () => {
  await Swal.fire({
    title: 'Elemento Actualizada!',
      text: 'El elemento ha sido actualizada correctamente.',
      icon: 'success',
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: true,
      position:"top-end",
      customClass: {
        container: 'swal2-custom-update',
        popup: 'swal2-custom-update',
        header: 'swal2-custom-update',
        title: 'swal2-custom-update',
        htmlContainer: 'swal2-custom-update',
        confirmButton: 'swal2-custom-update'
      }
    });
};
// Función para mostrar una alerta de advertencia
export const SwalWarning = async () => {
  return await Swal.fire({ // Asegúrate de retornar el resultado
    title: '¿Estás seguro?',
    text: "No podrás recuperar una vez eliminado.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    customClass: {
      container: 'swal2-custom-delete',
      popup: 'swal2-custom-delete',
      header: 'swal2-custom-delete',
      title: 'swal2-custom-delete',
      htmlContainer: 'swal2-custom-delete',
      confirmButton: 'swal2-custom-delete',
      cancelButton: 'swal2-custom-delete',
    },
  });
};

// Función para mostrar una alerta de eliminación
export const SwalDelete = async () => {
  await Swal.fire({
    title: '¡Eliminado!',
    text: 'El elemento ha sido eliminado.',
    icon: 'success',
    showConfirmButton: false,
    timer: 1000,
    timerProgressBar: true,
    customClass: {
      container: 'swal2-custom-delete',
      popup: 'swal2-custom-delete',
      header: 'swal2-custom-delete',
      title: 'swal2-custom-delete',
      htmlContainer: 'swal2-custom-delete',
      confirmButton: 'swal2-custom-delete',
    },
  });
};

// Exportar como valor por defecto
export default {
  SwalSuccess, SwalUpdate, SwalWarning, SwalDelete
}
</script>

<style scoped>

</style>