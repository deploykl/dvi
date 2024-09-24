<template>
  <main id="main" class="main">
    <div>
      <h1 class="mb-4">Mes {{ mes }}</h1>
      <form @submit.prevent="subirArchivos">
        <div class="form-group">
          <label for="file">Archivo:</label>
          <input type="file" @change="handleFileUpload" class="form-control" />
        </div>
        <button type="submit" class="btn btn-primary mt-3" :disabled="loading">
          {{ loading ? 'Subiendo...' : 'Subir Archivo' }}
        </button>
      </form>

      <h2 class="mt-4">Archivos Subidos</h2>
      <p>Total de Archivos: {{ totalArchivos }}</p>

      <!-- Botón de Descargar Todos con barra de progreso -->
      <div class="mb-4">
        <button @click="descargarTodos" class="btn btn-success mt-3 mb-2" :disabled="loading">
          <i class="fas fa-file-archive"></i> Descargar Todos
        </button>
        <div v-if="showProgress" class="progress mt-3">
          <div class="progress-bar" role="progressbar" :style="{ width: progress + '%' }">
            {{ progress }}%
          </div>
        </div>
        <div v-if="showMessage" class="alert alert-success mt-2">
          Archivos descargados con éxito.
        </div>
      </div>

      <table class="table table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre del Archivo</th>
            <th>Fecha de Subida</th>
            <th>Vista Previa</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(file, index) in archivos" :key="file.id">
            <td>{{ index + 1 }}</td>
            <td>{{ getFileName(file.archivo) }}</td>
            <td>{{ new Date(file.fecha_subida).toLocaleDateString() }}</td>
            <td class="text-center">
              <template v-if="isImage(file.archivo)">
                <button @click="openModal(file.archivo)" class="btn btn-link text-primary">
                  <i class="fas fa-eye"></i>
                </button>
              </template>
              <template v-else-if="isPdf(file.archivo)">
                <a :href="file.archivo" target="_blank" class="btn btn-link text-danger">
                  <i class="fas fa-eye"></i>
                </a>
              </template>
              <template v-else-if="isExcel(file.archivo)">
                <a :href="file.archivo" target="_blank" class="btn btn-link text-success">
                  <i class="fas fa-file-download"></i>
                </a>
              </template>
              <template v-else-if="isWord(file.archivo)">
                <a :href="file.archivo" target="_blank" class="btn btn-link text-primary">
                  <i class="fas fa-file-download"></i>
                </a>
              </template>
              <template v-else-if="isText(file.archivo)">
                <button @click="descargarTexto(file.archivo)" class="btn btn-link text-secondary">
                  <i class="fas fa-eye"></i>
                </button>
              </template>
              <template v-else>
                <a :href="file.archivo" target="_blank" class="btn btn-link text-primary">
                  <span class="text-muted"><i class="fas fa-download"></i></span>
                </a>
              </template>
            </td>
            <td>
              <button @click="eliminarArchivo(file.id)" class="btn btn-danger btn-sm">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para vista previa de imagen -->
    <div class="modal fade" id="imageModal" tabindex="-1" role="dialog" aria-labelledby="imageModalLabel"
      aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="imageModalLabel">Vista Previa de Imagen - {{ currentFileName }}</h5>
            <button type="button" class="btn btn-danger ms-auto" data-bs-dismiss="modal">Cerrar</button>
          </div>
          <div class="modal-body">
            <img :src="currentImage" alt="Vista Previa" class="img-fluid" />
          </div>
        </div>
      </div>
    </div>

  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../../components/axios';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as bootstrap from 'bootstrap';

const file = ref(null);
const loading = ref(false);
const archivos = ref([]);
const totalArchivos = ref(0);
const route = useRoute();
const mes = route.params.mes;
const reporteId = route.params.reporteId;
const currentImage = ref(null);
const currentFileName = ref('');  // Añadido para almacenar el nombre del archivo actual
const showProgress = ref(false);
const progress = ref(0);
const showMessage = ref(false);

const handleFileUpload = (event) => {
  file.value = event.target.files[0];
};

const openModal = (file) => {
  if (file) {
    currentImage.value = file;
    currentFileName.value = getFileName(file);
    new bootstrap.Modal(document.getElementById('imageModal')).show();
  } else {
    console.error('No se pudo abrir el modal porque el archivo es undefined');
  }
};

const subirArchivos = async () => {
  if (!file.value) {
    alert('Por favor, seleccione un archivo.');
    return;
  }

  loading.value = true;

  const formData = new FormData();
  formData.append('archivo', file.value);
  formData.append('reporte_tarea', reporteId);

  try {
    const accessToken = localStorage.getItem('auth_token');
    if (!accessToken) {
      console.error('No se encontró el token de autenticación.');
      return;
    }

    await api.post(`poi/archivo/`, formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    alert('Archivo subido exitosamente.');
    obtenerArchivos();
  } catch (error) {
    console.error('Error al subir el archivo:', error.response ? error.response.data : error.message);
    alert('Error al subir el archivo.');
  } finally {
    loading.value = false;
  }
};

const obtenerArchivos = async () => {
  try {
    const accessToken = localStorage.getItem('auth_token');
    if (!accessToken) {
      console.error('No se encontró el token de autenticación.');
      return;
    }

    const response = await api.get(`poi/archivo/`, {
      params: { mes, tarea: reporteId },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    archivos.value = response.data;
    totalArchivos.value = archivos.value.length;
  } catch (error) {
    console.error('Error al obtener los archivos:', error.response ? error.response.data : error.message);
  }
};

const eliminarArchivo = async (id) => {
  if (confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
    loading.value = true;
    try {
      const accessToken = localStorage.getItem('auth_token');
      if (!accessToken) {
        console.error('No se encontró el token de autenticación.');
        return;
      }

      await api.delete(`poi/archivo/${id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      alert('Archivo eliminado exitosamente.');
      obtenerArchivos();  // Actualiza la lista de archivos
    } catch (error) {
      console.error('Error al eliminar el archivo:', error.response ? error.response.data : error.message);
      alert('Error al eliminar el archivo.');
    } finally {
      loading.value = false;
    }
  }
};

const getFileName = (url) => {
  return url.split('/').pop();
};

const isImage = (url) => /\.(jpg|jpeg|png|gif)$/i.test(url);
const isPdf = (url) => /\.pdf$/i.test(url);
const isExcel = (url) => /\.(xls|xlsx)$/i.test(url);
const isWord = (url) => /\.(doc|docx)$/i.test(url);
const isText = (url) => /\.txt$/i.test(url);

const descargarTexto = (url) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = getFileName(url);
  link.click();
};

const descargarTodos = async () => {
  showProgress.value = true;
  progress.value = 0;

  const zip = new JSZip();
  const folder = zip.folder("archivos");

  for (const [index, file] of archivos.value.entries()) {
    const response = await fetch(file.archivo);
    const blob = await response.blob();
    folder.file(getFileName(file.archivo), blob);
    progress.value = Math.round(((index + 1) / archivos.value.length) * 100);
  }

  zip.generateAsync({ type: "blob" })
    .then(function (content) {
      saveAs(content, "archivos.zip");
      showMessage.value = true;
      setTimeout(() => {
        showMessage.value = false;
      }, 3000);
      showProgress.value = false;
    });
};

onMounted(() => {
  obtenerArchivos();
});
</script>

<style scoped>
.progress-bar {
  transition: width 0.4s ease;
}
</style>
