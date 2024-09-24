<template>
  <main id="main" class="main">
    <table class="table table-bordered text-center">
      <thead>
        <tr>
          <th scope="col">N°</th> <!-- Cambié el encabezado de ID a # -->
          <th>Tarea</th>
          <th v-if="isStaff || (isSuperuser && !isStaff)">Trazabilidad</th>
          <th>Unidad de Medida</th>
          <th v-if="isStaff || (isSuperuser && !isStaff)">Prog. Física Anual</th>
          <th>Reprog. Física Anual</th>
          <th>Ejec. Física Anual</th>
          <th>% Ejec. Anual</th>
          <th>Ingresar Ejecución</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(tarea, index) in tareas" :key="tarea.id">
          <td>{{ index + 1 }}</td> <!-- Cambié la columna ID por el enumerado -->
          <td class="text-start">{{ tarea.name }}</td>
          <td v-if="isStaff || (isSuperuser && !isStaff)">{{ tarea.trazabilidad }}</td>
          <td>{{ tarea.medida_name }}</td>
          <td v-if="isStaff || (isSuperuser && !isStaff)">{{ tarea.TotalProgFisica }}</td>
          <td>{{ tarea.TotalReproFisica }}</td>
          <td>{{ tarea.TotalEjecFisica }}</td>
          <td>
            <span :class="{
              'badge bg-danger': tarea.PorEjecAvance <= 85,
              'badge bg-warning': tarea.PorEjecAvance > 85 && tarea.PorEjecAvance <= 90,
              'badge bg-success': tarea.PorEjecAvance > 90 && tarea.PorEjecAvance <= 100,
              'bg-rosado': tarea.PorEjecAvance > 100
            }">
              {{ tarea.PorEjecAvance }}%
            </span>
            <div v-if="tarea.PorEjecAvance <= 85" class="text-danger">Deficiente</div>
            <div v-else-if="tarea.PorEjecAvance > 85 && tarea.PorEjecAvance <= 90" class="text-warning">Regular</div>
            <div v-else-if="tarea.PorEjecAvance > 90 && tarea.PorEjecAvance <= 100" class="text-success">Bueno</div>
            <div v-else class="text-dark">Exceso</div>
          </td>
          <td>
            <button @click="goToTareaDetalle(tarea.id)" class="btn btn-info"><i
                class="fa-solid fa-pen-to-square"></i></button>
          </td>
        </tr>
        <!-- Fila de totales -->
        <tr :class="{ 'is-staff': isStaff || (isSuperuser && !isStaff) }">
          <td colspan="4" v-if="isStaff || (isSuperuser && !isStaff)" class="text-end font-weight-bold text-center">
            Total</td>
          <td colspan="3" v-else class="text-end font-weight-bold text-center">Total</td>
          <td v-if="isStaff || (isSuperuser && !isStaff)">{{ totalProgFisica }}</td>
          <td>{{ totalReproFisica }}</td>
          <td>{{ totalEjecFisica }}</td>
          <td>
            <span :class="getBadgeClass(totalPorEjecAvance)">
              {{ totalPorEjecAvance }}%
            </span>
            <div :class="getTextClass(totalPorEjecAvance)">
              {{ getMensajeAvance(totalPorEjecAvance) }}
            </div>
          </td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../components/axios';

const tareas = ref([]);
const route = useRoute();
const router = useRouter();
// Definir las variables reactivas
const isSuperuser = ref(false);
const isStaff = ref(false);

const goToTareaDetalle = (tareaId) => {
  router.push({ name: 'tarea-detalle', params: { id: tareaId } });
};

onMounted(async () => {
  // Obtener el token de autenticación
  const accessToken = localStorage.getItem('auth_token');
  if (!accessToken) {
    console.error('No se encontró el token de autenticación.');
    return;
  }

  try {
    // Obtener el ID de la actividad desde las rutas
    const actividadId = route.params.id;

    // Realizar la solicitud para obtener las tareas
    const response = await api.get(`poi/tarea/?actividad=${actividadId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    // Asignar las tareas a la variable reactiva
    tareas.value = response.data;
  } catch (error) {
    console.error('Error al obtener las tareas:', error.response ? error.response.data : error.message);
  }

  // Obtener los valores de is_superuser y is_staff desde localStorage
  const superuser = localStorage.getItem('is_superuser');
  const staff = localStorage.getItem('is_staff');

  // Asignar los valores a las variables reactivas
  isSuperuser.value = superuser === 'true';
  isStaff.value = staff === 'true';

  // Mostrar los valores en consola
  console.log('Superuser:', isSuperuser.value);
  console.log('Staff:', isStaff.value);
});




// Calcula los totales solo para las filas con Trazabilidad "SI"
const totalProgFisica = computed(() =>
  tareas.value.filter(tarea => tarea.trazabilidad === 'SI')
    .reduce((total, tarea) => total + (parseFloat(tarea.TotalProgFisica) || 0), 0).toFixed(2)
);

const totalReproFisica = computed(() =>
  tareas.value.filter(tarea => tarea.trazabilidad === 'SI')
    .reduce((total, tarea) => total + (parseFloat(tarea.TotalReproFisica) || 0), 0).toFixed(2)
);

const totalEjecFisica = computed(() =>
  tareas.value.filter(tarea => tarea.trazabilidad === 'SI')
    .reduce((total, tarea) => total + (parseFloat(tarea.TotalEjecFisica) || 0), 0).toFixed(2)
);

const totalPorEjecAvance = computed(() => {
  const totalRepro = parseFloat(totalReproFisica.value);
  const totalEjec = parseFloat(totalEjecFisica.value);
  return totalRepro > 0 ? (totalEjec / totalRepro * 100).toFixed(2) : '0.00';
});

// Funciones para calcular clases y mensajes según el avance
const getBadgeClass = (porcentaje) => {
  if (porcentaje <= 85) {
    return 'badge bg-danger';
  } else if (porcentaje > 85 && porcentaje <= 90) {
    return 'badge bg-warning';
  } else if (porcentaje > 90 && porcentaje <= 100) {
    return 'badge bg-success';
  } else {
    return 'bg-rosado';
  }
};

const getTextClass = (porcentaje) => {
  if (porcentaje <= 85) {
    return 'text-danger';
  } else if (porcentaje > 85 && porcentaje <= 90) {
    return 'text-warning';
  } else if (porcentaje > 90 && porcentaje <= 100) {
    return 'text-success';
  } else {
    return 'text-dark';
  }
};

const getMensajeAvance = (porcentaje) => {
  if (porcentaje <= 85) {
    return 'Deficiente';
  } else if (porcentaje > 85 && porcentaje <= 90) {
    return 'Regular';
  } else if (porcentaje > 90 && porcentaje <= 100) {
    return 'Bueno';
  } else {
    return 'Exceso';
  }
};
</script>



<style></style>
