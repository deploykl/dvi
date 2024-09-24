<template>
  <main id="main" class="main">
    <table class="table table-bordered">
      <thead>
        <tr>
          <th scope="col">N° MES</th>
          <th>AÑO</th>
          <th>MESES</th>
          <th>PROG. PRESUPUESTAL</th>
          <th>REPROG. PRESUPUESTAL</th>
          <th>EJECT. PRESUPUESTAL</th>
          <th>%. avance</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="reporte in reportes" :key="reporte.id"
          :class="{ 'bg-light': reporte.mes.toUpperCase() === currentMonthName }">
          <td>{{ reporte.id }}</td>
          <td>{{ reporte.year }}</td>
          <td>
            <span :class="['badge', reporte.mes.toUpperCase() === currentMonthName ? 'bg-success' : 'bg-secondary']">
              {{ reporte.mes }}
            </span>
          </td>
          <td>
            <input v-model.number="reporte.prog_ppto" type="number" step="0.01" class="form-control">
          </td>
          <td>
            <input v-model.number="reporte.repro_ppto" type="number" step="0.01" class="form-control">
          </td>
          <td>
            <input v-model.number="reporte.ejec_ppto" type="number" step="0.01" class="form-control">
          </td>
          <td>{{ PorcentajeAvance(reporte) }}%</td>
        </tr>
        <!-- Fila de totales -->
        <tr>
          <td colspan="3" class="text-center"><strong>Total</strong></td>
          <td>{{ totalProgPpto }}</td>
          <td>{{ totalReproPpto }}</td>
          <td>{{ totalEjecPpto }}</td>
          <td>{{ totalPorcentajeAvance }}%</td>
        </tr>
      </tbody>
    </table>
    <button @click="guardarTodosRegistros" class="btn btn-primary mt-3" :disabled="loading">
      <span v-if="loading">Guardando...</span>
      <span v-else>Guardar Todos los Registros</span>
    </button>
  </main>
</template>

<script setup>
import api  from '../../components/axios';
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';

const reportes = ref([]);
const loading = ref(false);
const route = useRoute();
const currentMonthName = ref(new Date().toLocaleString('es-ES', { month: 'long' }).toUpperCase());

const obtenerReportes = async () => {
  const accessToken = localStorage.getItem('auth_token');
  if (!accessToken) {
    console.error('No se encontró el token de autenticación.');
    return;
  }

  try {
    const actividadId = route.params.id;
    const response = await api.get(`poi/reporte-actividad/?actividad=${actividadId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    reportes.value = response.data;
  } catch (error) {
    console.error('Error al obtener los reportes:', error.response ? error.response.data : error.message);
  }
};

onMounted(obtenerReportes);

const guardarRegistro = async (reporte) => {
  const accessToken = localStorage.getItem('auth_token');
  if (!accessToken) {
    console.error('No se encontró el token de autenticación.');
    return 'No se encontró el token de autenticación.';
  }

  try {
    await api.put(`poi/reporte-actividad/${reporte.id}/`, reporte, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return null;
  } catch (error) {
    const errorMsg = error.response?.data?.detail || error.message;
    return errorMsg;
  }
};

const guardarTodosRegistros = async () => {
  loading.value = true;
  const errores = [];

  await Promise.all(reportes.value.map(async (reporte) => {
    const error = await guardarRegistro(reporte);
    if (error) {
      errores.push({ reporteId: reporte.id, error });
    }
  }));

  loading.value = false;

  if (errores.length === 0) {
    alert('Todos los registros guardados exitosamente.');
  } else {
    alert(`Se encontraron errores al guardar algunos registros: ${errores.map(e => `ID ${e.reporteId}: ${e.error}`).join(', ')}`);
    console.error('Errores al guardar los registros:', errores);
  }
};

const PorcentajeAvance = (reporte) => {
  if (reporte.repro_ppto > 0) {
    return (reporte.ejec_ppto / reporte.repro_ppto * 100).toFixed(2);
  }
  return '0.00';
};

// Métodos para calcular los totales
const totalProgPpto = computed(() => reportes.value.reduce((total, r) => total + (parseFloat(r.prog_ppto) || 0), 0).toFixed(2));
const totalReproPpto = computed(() => reportes.value.reduce((total, r) => total + (parseFloat(r.repro_ppto) || 0), 0).toFixed(2));
const totalEjecPpto = computed(() => reportes.value.reduce((total, r) => total + (parseFloat(r.ejec_ppto) || 0), 0).toFixed(2));

const totalPorcentajeAvance = computed(() => {
  const totalRepro = parseFloat(totalReproPpto.value);
  const totalEjec = parseFloat(totalEjecPpto.value);
  return totalRepro > 0 ? (totalEjec / totalRepro * 100).toFixed(2) : '0.00';
});
</script>

<style scoped>
.table input.form-control {
  width: 100px;
}

.badge {
  font-size: 0.8rem;
  padding: 0.5em 1em;
}

.bg-light {
  background-color: #f8f9fa !important;
}
</style>
