<template>
  <main id="main" class="main">
    <div class="card">
      <div class="card-body mt-2">
        <button type="button" class="btn btn-success float-start mt-2" @click="openModal">
          <i class="fa-solid fa-circle-plus"></i> Agregar
        </button>
        <TableComponent :headers="[
          { key: 'codigo', label: 'CÓDIGO', filterable: false },
          { key: 'name', label: 'ACTIVIDAD', filterable: false },
          { key: 'grupo_name', label: 'GRUPO', filterable: true },
          { key: 'estado', label: 'ESTADO', filterable: true },
          { key: 'dependencia_name', label: 'CENTRO DE COSTO', filterable: true },
          { key: 'medida_name', label: 'MEDIDA', filterable: true }
        ]" :items="actividades" @edit="UPDATE_ID" @delete="DELETE" @delete-multiple="ELIMINARMULTIPLE" />
      </div>
    </div>

    <!-- Modal para Agregar/Editar Actividad -->
    <div class="modal fade" id="addActivityModal" tabindex="-1" aria-labelledby="addActivityModalLabel"
      aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addActivityModalLabel">{{ isEditing ? 'Editar Actividad' : 'Agregar Actividad'
              }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
              @click="resetForm"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="isEditing ? UPDATE() : ADD()">
              <div class="mb-3">
                <label for="codigo" class="form-label">Código</label>
                <input type="text" class="form-control" id="codigo" v-model="form.codigo">
              </div>
              <div class="mb-3">
                <label for="name" class="form-label">Nombre</label>
                <textarea class="form-control" id="name" v-model="form.name" rows="4" required></textarea>
              </div>
              <div class="mb-3">
                <label for="grupo" class="form-label">Grupo</label>
                <select class="form-select" id="grupo" v-model="form.grupo">
                  <option disabled value="">-- Elija una opción --</option>
                  <option v-for="gru in grupos" :key="gru.id" :value="gru.id">{{ gru.name }}</option>
                </select>

              </div>

              <div class="mb-3">
                <label for="estado" class="form-label">Estado</label>
                <select class="form-select" id="estado" v-model="form.estado" required>
                  <option disabled value="">-- Elija una opción --</option>
                  <option :value="true">Activo</option>
                  <option :value="false">Inactivo</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="dependencia" class="form-label">Dependencia</label>
                <select class="form-select" id="dependencia" v-model="form.dependencia" required>
                  <option disabled value="">-- Elija una opción --</option>
                  <option v-for="dep in dependencias" :key="dep.id" :value="dep.id">{{ dep.name }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="medida" class="form-label">Medida</label>
                <select class="form-select" id="medida" v-model="form.medida" required>
                  <option disabled value="">-- Elija una opción --</option>
                  <option v-for="med in medidas" :key="med.id" :value="med.id">{{ med.codigo }} - {{ med.name }}
                  </option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary">{{ isEditing ? 'Actualizar' : 'Agregar' }}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>


<script setup>
import { ref } from 'vue';
import api from '../../../components/axios';
import * as bootstrap from 'bootstrap';
import TableComponent from '@/components/TableComponent.vue';
import { SwalSuccess, SwalWarning, SwalDelete, SwalUpdate } from '../../../components/widgets/SwalComponent'; // Asegúrate de que la ruta sea correcta

const dependencias = ref([]);
const medidas = ref([]); // Añadido para almacenar las medidas
const actividades = ref([]);
const grupos = ref([]);

const form = ref({
  codigo: '',
  name: '',
  estado: '',
  dependencia: '',
  medida: '',
  grupo: '',
});

const resetForm = () => {
  form.value = {
    codigo: '',
    name: '',
    estado: '',
    dependencia: '',
    medida: '',
    grupo: '',
  };
}
const isEditing = ref(false);

const openModal = () => {
  isEditing.value = false;

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

    const responseDependencias = await api.get('personal/dependencia/', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    dependencias.value = responseDependencias.data;

    const responseMedidas = await api.get('poi/medida-actividad/', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    medidas.value = responseMedidas.data;

    const responseActividades = await api.get('poi/actividad/', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    actividades.value = responseActividades.data.activities;

    // Obtener grupos
    const responseGrupo = await api.get('poi/grupo/', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    grupos.value = responseGrupo.data;
    // Verifica que group_name esté presente en cada actividad
    console.log(actividades.value);

  } catch (error) {
    console.error('Error al obtener los datos:', error.response ? error.response.data : error.message);
  }
};


const ADD = async () => {
  try {
    const accessToken = getAuthToken();
    console.log('Form data before sending:', form.value);

    const response = await api.post('poi/actividad/', {
      ...form.value,
      dependencia: form.value.dependencia,
      medida: form.value.medida,
      grupo: form.value.grupo, // Asegúrate de que este valor no es null
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response from API:', response.data);
    actividades.value.push(response.data);
    const modal = bootstrap.Modal.getInstance(document.getElementById('addActivityModal'));
    modal.hide();
    resetForm();

    await SwalSuccess();
  } catch (error) {
    console.error('Error al agregar la actividad:', error.response ? error.response.data : error.message);
  }
};

const UPDATE_ID = (actividad) => {
  isEditing.value = true;
  form.value = { ...actividad }; // Asegúrate de que la medida esté incluida en `form`
  const modal = new bootstrap.Modal(document.getElementById('addActivityModal'));
  modal.show();
};

const UPDATE = async () => {
  try {
    const accessToken = getAuthToken();
    const response = await api.put(`poi/actividad/${form.value.id}/`, {
      ...form.value,
      dependencia: form.value.dependencia,
      medida: form.value.medida,
      grupo: form.value.grupo, // Aquí también

    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const index = actividades.value.findIndex(actividad => actividad.id === form.value.id);
    actividades.value[index] = response.data;
    const modal = bootstrap.Modal.getInstance(document.getElementById('addActivityModal'));
    modal.hide();
    resetForm();

    // SWEETALERT IMPORTADO SWALCOMPONENT
    await SwalUpdate();

  } catch (error) {
    console.error('Error al actualizar:', error.response ? error.response.data : error.message);
  }
};


const DELETE = async (id) => {
  try {
    const accessToken = getAuthToken();
    // SWEETALERT IMPORTADO SWALCOMPONENT
    const result = await SwalWarning();

    if (result.isConfirmed) {
      await api.delete(`poi/actividad/${id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      actividades.value = actividades.value.filter(actividad => actividad.id !== id);

      // SWEETALERT IMPORTADO SWALCOMPONENT
      await SwalDelete();
    }
  } catch (error) {
    console.error('Error al eliminar:', error.response ? error.response.data : error.message);
  }
};

const ELIMINARMULTIPLE = async (selectedIds) => {
  try {
    const accessToken = getAuthToken();
    // SWEETALERT IMPORTADO SWALCOMPONENT
    const result = await SwalWarning();

    if (result.isConfirmed) {
      await api.post('poi/actividad/bulk-delete/', { ids: selectedIds }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      actividades.value = actividades.value.filter(actividad => !selectedIds.includes(actividad.id));

      // SWEETALERT IMPORTADO SWALCOMPONENT
      await SwalDelete();
    }
  } catch (error) {
    console.error('Error al eliminar múltiples elementos:', error.response ? error.response.data : error.message);
  }
};

LISTAR();
</script>
