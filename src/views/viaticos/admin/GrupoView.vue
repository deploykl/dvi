<template>
  <main id="main" class="main">
    <div class="card">
      <div class="card-body mt-2">
        <button type="button" class="btn btn-success float-start mt-1" @click="openModal">
          <i class="fa-solid fa-circle-plus"></i> Agregar
        </button>
        <TableComponent :headers="[
          { key: 'name', label: 'Nombre', filterable: false },
        ]" 
        :items="Grupo"
        @edit="UPDATE_ID" 
        @delete="DELETE"
        @delete-multiple="ELIMINARMULTIPLE"
        />
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
                <label for="name" class="form-label">Nombre</label>
                <input type="text" class="form-control" id="name" v-model="form.name" rows="4" required></input>
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

const Grupo = ref([]);
const form = ref({
  codigo: '',
  name: '',
});
const resetForm = () => {
  form.value = {
    codigo: '',
    name: '',
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
    const responseGrupo = await api.get('poi/grupo/', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    Grupo.value = responseGrupo.data; // Ajusta según la estructura real de la respuesta
  } catch (error) {
    console.error('Error al obtener los datos:', error.response ? error.response.data : error.message);
  }
};

//LLAMANDO EL LISTADO
LISTAR();

const ADD = async () => {
  try {
    const accessToken = getAuthToken();
    const response = await api.post('poi/grupo/', {
      ...form.value,
      Grupo: form.value.Grupo,
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    Grupo.value.push(response.data);
    const modal = bootstrap.Modal.getInstance(document.getElementById('addActivityModal'));
    modal.hide();
    resetForm();

    // SWEETALERT IMPORTADO SWALCOMPONENT
    await SwalSuccess();

  } catch (error) {
    console.error('Error al agregar la actividad:', error.response ? error.response.data : error.message);
  }
};

const UPDATE_ID = (grupo) => {
  isEditing.value = true;
  form.value = { ...grupo }; // Asegúrate de que la medida esté incluida en `form`
  const modal = new bootstrap.Modal(document.getElementById('addActivityModal'));
  modal.show();
};

const UPDATE = async () => {
  try {
    const accessToken = getAuthToken();
    const response = await api.put(`poi/grupo/${form.value.id}/`, {
      ...form.value,
      Grupo: form.value.Grupo,
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const index = Grupo.value.findIndex(item => item.id === form.value.id);
    Grupo.value[index] = response.data;
    const modal = bootstrap.Modal.getInstance(document.getElementById('addActivityModal'));
    modal.hide();
    resetForm();

    // SWEETALERT IMPORTADO SWALCOMPONENT
    await SwalUpdate();

  } catch (error) {
    console.error('Error al actualizar la actividad:', error.response ? error.response.data : error.message);
  }
};

const DELETE = async (id) => {
  try {
    const accessToken = getAuthToken();
    // SWEETALERT IMPORTADO SWALCOMPONENT
    const result = await SwalWarning(); 

    if (result.isConfirmed) {
      await api.delete(`poi/grupo/${id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      Grupo.value = Grupo.value.filter(Grupo => Grupo.id !== id);
      
    // SWEETALERT IMPORTADO SWALCOMPONENT
      await SwalDelete();

    }
  } catch (error) {
    console.error('Error al eliminar la actividad:', error.response ? error.response.data : error.message);
  }
};

const ELIMINARMULTIPLE = async (selectedIds) => {
  try {
    const accessToken = getAuthToken();
    // SWEETALERT IMPORTADO SWALCOMPONENT
    const result = await SwalWarning(); 

    if (result.isConfirmed) {
      await api.post('poi/grupo/bulk-delete/', { ids: selectedIds }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      Grupo.value = Grupo.value.filter(Grupo => !selectedIds.includes(Grupo.id));
      
      // SWEETALERT IMPORTADO SWALCOMPONENT
      await SwalDelete();
    }
  } catch (error) {
    console.error('Error al eliminar múltiples Grupo:', error.response ? error.response.data : error.message);
  }
};

</script>

<style scoped>
</style>