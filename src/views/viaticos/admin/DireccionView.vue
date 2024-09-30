<template>
    <main id="main" class="main">
        <div class="card">
            <div class="card-body mt-2">
                <button type="button" class="btn btn-success float-start mt-1" @click="openModal">
                    <i class="fa-solid fa-circle-plus"></i> Agregar
                </button>
                <TableComponent :headers="[
                    { key: 'name', label: 'Nombre', filterable: false },

                ]" :items="usuario" @edit="UPDATE_ID" @delete="DELETE" @delete-multiple="ELIMINARMULTIPLE" />
            </div>
        </div>

        <!-- Modal para Agregar/Editar Usuario -->
        <div class="modal fade" id="addActivityModal" tabindex="-1" aria-labelledby="addActivityModalLabel"
            aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="addActivityModalLabel">{{ isEditing ? 'Editar Direccíon' : 'Agregar Dirección' }}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                            @click="resetForm"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="isEditing ? UPDATE() : ADD()">
                            <div class="mb-3">
                                <label for="name" class="form-label">Nombre de la dirección</label>
                                <input type="text" class="form-control" id="name" v-model="form.name"
                                    required />
                            </div>
                          
                            <button type="submit" class="btn btn-primary">{{ isEditing ? 'Actualizar' : 'Agregar'
                                }}</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>

<script setup>
import { ref, watch } from 'vue';
import api from '../../../components/axios';
import * as bootstrap from 'bootstrap';
import TableComponent from '@/components/TableComponent.vue';
import { SwalSuccess, SwalWarning, SwalDelete, SwalUpdate } from '../../../components/widgets/SwalComponent';

const direccion = ref([]);


const form = ref({
    id: null, // Asegúrate de incluir el ID
    name: '',
   
});

const resetForm = () => {
    form.value = {
        id: null, // Reinicia el ID
        name: '',
    };
}

const isEditing = ref(false);

const openModal = () => {
    isEditing.value = false;
    resetForm(); // Reinicia el formulario al abrir el modal

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

        const responseDireccion = await api.get('dvi/direccion/', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        direccion.value = responseDireccion.data;

    } catch (error) {
        console.error('Error al obtener los datos:', error.response ? error.response.data : error.message);
    }
};

// Llamando el listado
LISTAR();
const ADD = async () => {
    try {
        const accessToken = getAuthToken();
        const response = await api.post('dvi/direccion/', {
            ...form.value,  // Los datos del formulario se envían al servidor
            grupo: form.value.grupo,  // Aquí se pasa el grupo seleccionado
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        // Agregar el nuevo usuario a la tabla
        direccion.value.push(response.data);

        const modal = bootstrap.Modal.getInstance(document.getElementById('addActivityModal'));
        modal.hide();
        resetForm();

        await SwalSuccess();
    } catch (error) {
        console.error('Error al agregar:', error.response ? error.response.data : error.message);
    }
};

const UPDATE_ID = (direccion) => {
    console.log('Direccion a editar:', direccion); // Esto debería mostrar el usuario con su ID
    if (!direccion.id) {
        console.error('El ID del direccion no está presente');
        return;
    }

    isEditing.value = true;
    form.value = { ...direccion }; // Incluye el ID en el formulario
    const modal = new bootstrap.Modal(document.getElementById('addActivityModal'));
    modal.show();
};

const UPDATE = async () => {
    try {
        const accessToken = getAuthToken();
        const response = await api.put(`dvi/direccion/${form.value.id}/`, {
            ...form.value,
            grupo: form.value.grupo,  // Aquí se pasa el grupo seleccionado
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        // Actualizar el usuario en la tabla
        const index = usuario.value.findIndex(item => item.id === form.value.id);
        usuario.value[index] = response.data;
        const modal = bootstrap.Modal.getInstance(document.getElementById('addActivityModal'));
        modal.hide();
        resetForm();

        await SwalUpdate();
    } catch (error) {
        console.error('Error al actualizar:', error.response ? error.response.data : error.message);
    }
};



const DELETE = async (id) => {
    try {
        const accessToken = getAuthToken();
        const result = await SwalWarning();

        if (result.isConfirmed) {
            await api.delete(`dvi/direccion/${id}/`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            usuario.value = usuario.value.filter(direccion => direccion.id !== id);
            await SwalDelete();
        }
    } catch (error) {
        console.error('Error al eliminar la dirección:', error.response ? error.response.data : error.message);
    }
};
</script>

<style scoped></style>
