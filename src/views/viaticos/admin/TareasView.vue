<template>
  <main id="main" class="main">
    <!-- Filtro de Dependencia -->
    <!-- Filtros y Paginación -->
    <div class="mb-4 row align-items-center">
      <!-- Filtro de Dependencia -->
      <div class="col-md-2 mb-2">
        <label for="dependenciaFilter" class="form-label">Filtro por centro de costo</label>
        <select id="dependenciaFilter" v-model="selectedDependencia" class="form-select"
          @change="filtrarPorDependencia">
          <option class="text-center" value="">-- Mostrar todo --</option>
          <option v-for="dep in dependencias" :key="dep.id" :value="dep.id">{{ dep.id }} - {{ dep.name }}</option>
        </select>
      </div>

      <!-- Filtro de Filas por Página -->
      <div class="col-md-1 mb-2">
        <label for="rows-per-page" class="form-label">Filas</label>
        <select id="rows-per-page" v-model="rowsPerPage" class="form-select" @change="currentPage = 1">
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="20">20</option>
        </select>
      </div>

      <!-- Paginación -->
      <div class="col-md-9 mb-2 text-end">
        <nav aria-label="Page navigation">
          <ul class="pagination justify-content-end">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" @click="currentPage--" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
              </a>
            </li>
            <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
              <a class="page-link" @click="currentPage = page">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" @click="currentPage++" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>


    <div class="card shadow-sm" v-for="actividad in paginatedActividades" :key="actividad.id">
      <div class="card-body">
        <!-- Título de la Actividad -->
        <h5 class="card-title d-flex justify-content-between align-items-center">
          {{ actividad.id }} - {{ actividad.name }}
        </h5>
        <button type="button" class="btn btn-success" @click="openModal(actividad.id)">
          <i class="fa-solid fa-circle-plus btn-sm"></i> Agregar tarea
        </button>
        <!-- Lista de Tareas para la Actividad -->
        <table class="table table-hover table-bordered mt-3">
          <thead class="table-light">
            <tr>
              <th scope="col" class="col-1">MEDIDA</th>
              <th scope="col" class="col-3">TAREA</th>
              <th scope="col" class="col-1">TRAZABILIDAD</th>
              <th scope="col" class="col-3">CRITERIO DE RE-PROGRAMACIÓN</th>
              <th scope="col" class="col-3">DEFINICIÓN OPERACIONAL</th>
              <th scope="col" class="col-1">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in tareasPorActividad(actividad.id)" :key="task.id">
              <td class="text-center">{{ task.medida_name }}</td>
              <td>{{ task.name }}</td>
              <td class="text-center">{{ task.trazabilidad }}</td>
              <td>{{ task.criterio }}</td>
              <td>{{ task.definicion }}</td>
              <td class="text-center">
                <button type="button" class="btn btn-warning btn-sm me-2" @click="editTask(task)">
                  <i class="fa-solid fa-edit"></i>
                </button>
                <button type="button" class="btn btn-danger btn-sm" @click="DELETE(task.id)">
                  <i class="fa-solid fa-trash"></i>
                </button>

              </td>
            </tr>
            <tr v-if="!tareasPorActividad(actividad.id).length">
              <td colspan="6" class="text-center">No hay tareas registradas.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal para Agregar/Editar Tarea -->
    <div class="modal fade" id="addActivityModal" tabindex="-1" aria-labelledby="addActivityModalLabel"
      aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg"> <!-- Se agregó la clase modal-lg -->
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="taskModalLabel">{{ isEditing ? 'Editar Tarea' : 'Agregar Tarea' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
              @click="resetForm"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="isEditing ? UPDATE() : ADD()">
              <div class="mb-3">
                <label for="name" class="form-label">Nombre de la Tarea</label>
                <textarea class="form-control" id="name" v-model="form.name" rows="2" required></textarea>
              </div>
              <div class="mb-3">
                <label for="medida" class="form-label">Medida</label>
                <select class="form-select" id="medida" v-model="form.medida" required>
                  <option disabled value="">-- Elija una opción --</option>
                  <option v-for="med in medidas" :key="med.id" :value="med.id">{{ med.name }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="trazabilidad" class="form-label">Trazabilidad</label>
                <select class="form-select" id="trazabilidad" v-model="form.trazabilidad" required>
                  <option disabled value="">-- Elija una opción --</option>
                  <option value="SI">SI</option>
                  <option value="NO">NO</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="criterio" class="form-label">Criterio</label>
                <textarea class="form-control" id="criterio" v-model="form.criterio" rows="2" required></textarea>
              </div>
              <div class="mb-3">
                <label for="definicion" class="form-label">Definición</label>
                <textarea class="form-control" id="definicion" v-model="form.definicion" rows="2" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary mt-3">{{ isEditing ? 'Actualizar' : 'Agregar' }}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue';
import api from '../../../components/axios';
import * as bootstrap from 'bootstrap';
import { SwalSuccess, SwalWarning, SwalDelete, SwalUpdate } from '../../../components/widgets/SwalComponent'; // Asegúrate de que la ruta sea correcta
import { watch } from 'vue';

const tareas = ref([]);
const actividades = ref([]);
const medidas = ref([]);
const dependencias = ref([]); // Añadido para almacenar las dependencias
const actividadesFiltradas = ref([]);
const selectedDependencia = ref(''); // Definir selectedDependencia
const currentPage = ref(1);
const rowsPerPage = ref(10); // Número de actividades por página
const totalPages = ref(0);

const paginatedActividades = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return actividadesFiltradas.value.slice(start, end);
});
watch(actividadesFiltradas, () => {
  totalPages.value = Math.ceil(actividadesFiltradas.value.length / rowsPerPage.value);
});

const form = ref({
  actividad: '',
  name: '',
  trazabilidad: '',
  medida: '',
  criterio: '',
  definicion: '',
});
const isEditing = ref(false);

const tareasPorActividad = (actividadId) => {
  return tareas.value.filter(task => task.actividad === actividadId);
};

const resetForm = () => {
  form.value = {
    actividad: '',
    name: '',
    trazabilidad: '',
    medida: '',
    criterio: '',
    definicion: '',
  };
  isEditing.value = false;
};

const openModal = (actividadId) => {
  isEditing.value = false;
  form.value.actividad = actividadId;
  const modalElement = document.getElementById('addActivityModal');
  if (modalElement) {
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }
};

const getAuthToken = () => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.error('No se encontró el token de autenticación.');
    throw new Error('Token de autenticación no encontrado');
  }
  return token;
};

const LISTAR = async () => {
  try {
    const accessToken = getAuthToken();
    const responseTareas = await api.get('poi/tarea/', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    tareas.value = responseTareas.data;

    const responseMedidas = await api.get('poi/medida-tarea/', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    medidas.value = responseMedidas.data;

    const responseActividades = await api.get('poi/actividad/', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    actividades.value = responseActividades.data.activities;

    const responseDependencias = await api.get('personal/dependencia/', { // Asegúrate de que esta ruta sea correcta
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    dependencias.value = responseDependencias.data;
  } catch (error) {
    console.error('Error al obtener los datos:', error.response ? error.response.data : error.message);
  }
};
LISTAR();

const ADD = async () => {
  try {
    const accessToken = getAuthToken();
    const response = await api.post('poi/tarea/', form.value, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    tareas.value.push(response.data);
    const modal = bootstrap.Modal.getInstance(document.getElementById('addActivityModal'));
    modal.hide();
    resetForm();
    await SwalSuccess();

  } catch (error) {
    console.error('Error al agregar la tarea:', error.response ? error.response.data : error.message);
    if (error.response) {
      alert('Error en el servidor: ' + JSON.stringify(error.response.data));
    }
  }
};

const editTask = (tarea) => {
  isEditing.value = true;
  form.value = { ...tarea };
  const modal = new bootstrap.Modal(document.getElementById('addActivityModal'));
  modal.show();
};

const UPDATE = async () => {
  try {
    const accessToken = getAuthToken();

    const response = await api.put(`poi/tarea/${form.value.id}/`, form.value, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const index = tareas.value.findIndex(item => item.id === form.value.id);
    if (index !== -1) {
      tareas.value[index] = response.data;
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById('addActivityModal'));
    modal.hide();
    resetForm();

    await SwalUpdate();

  } catch (error) {
    console.error('Error al actualizar la tarea:', error.response ? error.response.data : error.message);
  }
};

const DELETE = async (id) => {
  try {
    const accessToken = getAuthToken();
    const result = await SwalWarning();
    if (result.isConfirmed) {
      await api.delete(`poi/tarea/${id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      tareas.value = tareas.value.filter(tarea => tarea.id !== id);
      await SwalDelete();
    }
  } catch (error) {
    console.error('Error al eliminar la tarea:', error.response ? error.response.data : error.message);
  }
};

const filtrarPorDependencia = () => {
  if (selectedDependencia.value) {
    actividadesFiltradas.value = actividades.value.filter(
      actividad => actividad.dependencia === parseInt(selectedDependencia.value)
    );
  } else {
    actividadesFiltradas.value = actividades.value;
  }
};

// Asegúrate de que actividadesFiltradas esté inicializada al cargar las actividades
watch(actividades, () => {
  actividadesFiltradas.value = actividades.value;
  filtrarPorDependencia(); // Aplica el filtro cuando se actualizan las actividades
});

</script>


<style></style>