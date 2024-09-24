<template>
  <main id="main" class="main">
    <div v-if="tarea">
      <p class="h5 text-primary">NOMBRE DE LA TAREA:</p>
      <p class="h6 text-secondary">{{ tarea.name }}</p>

      <p class="h5 text-primary">CRITERIO DE REPROGRAMACION:</p>
      <p class="h6 text-secondary">{{ tarea.criterio }}</p>

      <p class="h5 text-primary">DEFINICION OPERACIONAL:</p>
      <p class="h6 text-secondary">{{ tarea.definicion }}</p>

      <table class="table table-bordered text-center">
        <thead>
          <tr>
            <th>Meses</th>
            <th v-if="isStaff || (isSuperuser && !isStaff)">Campos</th>
            <th v-if="isStaff || (isSuperuser && !isStaff)">Prog. Física</th>
            <th>Reprog. Física</th>
            <th>Ejec. Física</th>
            <th>% Física</th>
            <th>Sustento</th>
            <th>Comentario</th>
            <th>Registrar Sustento</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(reporte) in reportes" :key="reporte.id">
            <tr :class="{ 'border-bottom-purple': reporte.mes.toUpperCase() === mesActual }">
              <td class="text-start">{{ reporte.mes }}</td>
              <td v-if="isStaff || (isSuperuser && !isStaff)" class="d-flex align-items-center">
                <input type="checkbox" v-model="reporte.campos_bloqueados" @change="actualizarEstado(reporte)"
                  class="me-2" />
                <span :class="{
                  'badge': true,
                  'bg-success': reporte.campos_bloqueados,
                  'bg-secondary': !reporte.campos_bloqueados
                }">
                  {{ reporte.campos_bloqueados ? 'Activado' : 'Desactivado' }}
                </span>
              </td>
              <td v-if="isStaff || (isSuperuser && !isStaff)">
                <input v-model.number="reporte.prog_fisica" type="text" class="form-control"
                  :disabled="!reporte.campos_bloqueados" />
              </td>
              <td>
                <input v-model.number="reporte.repro_fisica" type="text" class="form-control"
                  :disabled="!reporte.campos_bloqueados || !isSuperuser" />
              </td>
              <td>
                <input v-model.number="reporte.ejec_fisica" type="text" class="form-control"
                  :disabled="!reporte.campos_bloqueados" />
              </td>
              <td>
                <span :class="getBadgeClass(reporte)" class="badge">
                  {{ calcularPorcentajeFisica(reporte) }}%
                </span>
              </td>
              <td :class="calcularSustento(reporte).class">
                {{ calcularSustento(reporte).text || 'Sin información' }}
              </td>


              <td>
                <input v-model="reporte.comentario" type="text" class="form-control"
                  :disabled="!reporte.campos_bloqueados" />
              </td>
             
              <td>
                <router-link v-if="reporte.campos_bloqueados"
                  :to="{ name: 'upload', params: { mes: reporte.mes, reporteId: reporte.id } }" class="btn btn-success">
                  <i class="fas fa-upload"></i>
                </router-link>
                <button v-else class="btn btn-secondary" :disabled="true">
                  <i class="fas fa-upload"></i>
                </button>
              </td>
            </tr>
            <tr v-if="reporte.mes.toUpperCase() === mesActual && reporte.campos_bloqueados" class="table-danger">
              <td colspan="10" class="text-center">
                Días restantes para el final del mes: <strong>{{ diasRestantesMes }}</strong>
              </td>
            </tr>
          </template>
          <tr>
            <td colspan="2" v-if="isStaff || (isSuperuser && !isStaff)" class="text-center"><strong>Total</strong></td>
            <td  v-else class="text-center"><strong>Total</strong></td>
            <td v-if="isStaff || (isSuperuser && !isStaff)">{{ totalProgFisica }}</td>
            <td>{{ totalReproFisica }}</td>
            <td>{{ totalEjecFisica }}</td>
            <td>{{ totalPorcentajeFisica }}%</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <button @click="guardarTodosRegistros" class="btn btn-primary mt-3" :disabled="loading">
        {{ loading ? 'Guardando...' : 'Guardar Todos los Registros' }}
      </button>
    </div>
    <div v-else>
      <p>Cargando detalles de la tarea...</p>
    </div>
  </main>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import api from '../../components/axios';

const isSuperuser = ref(false);
const isStaff = ref(false);

onMounted(() => {
  const superuser = localStorage.getItem('is_superuser');
  const staff = localStorage.getItem('is_staff');

  isSuperuser.value = superuser === 'true';
  isStaff.value = staff === 'true';
});

const reportes = ref([]);
const tarea = ref(null);
const loading = ref(false);
const route = useRoute();

const mesActual = computed(() => {
  const fecha = new Date();
  return fecha.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
});

const diasRestantesMes = computed(() => {
  const fechaActual = new Date();
  const ultimoDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);
  return Math.ceil((ultimoDiaMes - fechaActual) / (1000 * 60 * 60 * 24));
});

onMounted(async () => {
  const accessToken = localStorage.getItem('auth_token');
  if (!accessToken) {
    console.error('No se encontró el token de autenticación.');
    return;
  }

  try {
    const tareaId = route.params.id;
    const response = await api.get(`poi/tarea/${tareaId}/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    tarea.value = response.data;
    reportes.value = response.data.mes || [];

    reportes.value.forEach(reporte => {
      reporte.campos_bloqueados = reporte.mes.toUpperCase() === mesActual.value ? true : reporte.campos_bloqueados;
    });
  } catch (error) {
    console.error('Error al obtener los detalles de la tarea:', error.response ? error.response.data : error.message);
  }
});

const calcularPorcentajeFisica = (reporte) => {
  if (reporte.repro_fisica > 0) {
    return (reporte.ejec_fisica / reporte.repro_fisica * 100).toFixed(2);
  }
  return '0.00';
};

const calcularSustento = (reporte) => {
  let sustento = { text: '', class: '' };

  if (reporte.ejec_fisica > reporte.repro_fisica) {
    sustento.text = 'Exceso de ejecución';
    sustento.class = 'text-rosado';
  } else if (reporte.repro_fisica === 0 && reporte.ejec_fisica > 0) {
    sustento.text = 'Ejecución no programada';
    sustento.class = 'text-danger';
  } else if (reporte.repro_fisica > reporte.ejec_fisica) {
    sustento.text = 'Déficit de ejecución';
    sustento.class = 'text-danger';
  } else if (calcularPorcentajeFisica(reporte) === '100.00') {
    sustento.text = 'Bueno';
    sustento.class = 'text-success';
  }

  return sustento; // Devuelve el objeto completo
};




const getBadgeClass = (reporte) => {
  if (reporte.ejec_fisica > reporte.repro_fisica) {
    return 'bg-rosado';
  } else if (reporte.repro_fisica === 0 && reporte.ejec_fisica > 0) {
    return 'bg-danger';
  } else if (reporte.repro_fisica > reporte.ejec_fisica) {
    return 'bg-danger';
  } else if (calcularPorcentajeFisica(reporte) === '100.00') {
    return 'bg-success';
  } else {
    return 'bg-dark';
  }
};


const actualizarEstado = async (reporte) => {
  const accessToken = localStorage.getItem('auth_token');
  if (!accessToken) {
    console.error('No se encontró el token de autenticación.');
    return;
  }

  try {
    await api.patch(`poi/reporte-tarea/${reporte.id}/`, { campos_bloqueados: reporte.campos_bloqueados }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error al actualizar el estado:', error.response ? error.response.data : error.message);
  }
};

const guardarRegistro = async (reporte) => {
  const accessToken = localStorage.getItem('auth_token');
  if (!accessToken) {
    console.error('No se encontró el token de autenticación.');
    return 'No se encontró el token de autenticación.';
  }

  // Calcular el sustento antes de guardar
  const sustento = calcularSustento(reporte);

  // Solo asignar sustento si es válido
  if (sustento && sustento.text) {
    reporte.sustento = sustento.text; // Asigna solo el texto
  } else {
    delete reporte.sustento; // Elimina la propiedad si no es válida
  }

  try {
    await api.put(`poi/reporte-tarea/${reporte.id}/`, reporte, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error al guardar el registro:', error.response ? error.response.data : error.message);
    return 'Error al guardar el registro.';
  }
};


const guardarTodosRegistros = async () => {
  loading.value = true;

  for (const reporte of reportes.value) {
    await guardarRegistro(reporte);
  }

  loading.value = false;
};

const totalProgFisica = computed(() => {
  return reportes.value.reduce((acc, reporte) => acc + (reporte.prog_fisica || 0), 0);
});

const totalReproFisica = computed(() => {
  return reportes.value.reduce((acc, reporte) => acc + (reporte.repro_fisica || 0), 0);
});

const totalEjecFisica = computed(() => {
  return reportes.value.reduce((acc, reporte) => acc + (reporte.ejec_fisica || 0), 0);
});

const totalPorcentajeFisica = computed(() => {
  const reproTotal = totalReproFisica.value;
  return reproTotal > 0 ? ((totalEjecFisica.value / reproTotal) * 100).toFixed(2) : 0;
});

</script>


<style>
.border-bottom-purple {
  border-bottom: 20px solid purple;
}
</style>
