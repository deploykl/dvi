<template>
  <main id="main" class="main">
    <div v-if="dependenciaCounts && tareaCounts">
      <div class="container">
        <table class="table table-bordered text-center">
          <thead>
            <tr>
              <th rowspan="2">Centro de Costo</th>
              <th rowspan="2">Actividades</th>
              <th rowspan="2">Tareas</th>
              <th colspan="4" v-if="isStaff || (isSuperuser && !isStaff)" class="text-center">Física</th>
              <th colspan="3" v-else class="text-center">Física</th>
              <th colspan="4" v-if="isStaff || (isSuperuser && !isStaff)" class="text-center">Presupuestal</th>
              <th colspan="3" v-else class="text-center">Presupuestal</th>
            </tr>
            <tr>
              <th v-if="isStaff || (isSuperuser && !isStaff)">Prog.</th>
              <th>Reprog.</th>
              <th>Ejec.</th>
              <th> % Ejec.</th>
              <th v-if="isStaff || (isSuperuser && !isStaff)">Prog.</th>
              <th>Reprog.</th>
              <th>Ejec.</th>
              <th>% Ejec.</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(actividadCount, dependencia) in dependenciaCounts" :key="dependencia">
              <td>{{ dependencia }}</td>
              <td>{{ actividadCount }}</td>
              <td>{{ tareaCounts[dependencia] || 0 }}</td>
              <td v-if="isStaff || (isSuperuser && !isStaff)">{{ SUM_TAREA_REPORT[dependencia]?.total_prog_fisica || 0
                }}</td>
              <td>{{ SUM_TAREA_REPORT[dependencia]?.total_repro_fisica || 0 }}</td>
              <td>{{ SUM_TAREA_REPORT[dependencia]?.total_ejec_fisica || 0 }}</td>

              <td>
                <span :class="getBadgeClass(PorEjecFisica(dependencia))">
                  {{ PorEjecFisica(dependencia) }}%
                </span>
                <div :class="getTextClass(PorEjecFisica(dependencia))">
                  {{ getMensajeAvance(PorEjecFisica(dependencia)) }}
                </div>
              </td>
              <td v-if="isStaff || (isSuperuser && !isStaff)">{{ SUM_ACTIVIDAD_REPORT[dependencia]?.total_prog_ppto || 0
                }}</td>
              <td>{{ SUM_ACTIVIDAD_REPORT[dependencia]?.total_repro_ppto || 0 }}</td>
              <td>{{ SUM_ACTIVIDAD_REPORT[dependencia]?.total_ejec_ppto || 0 }}</td>
              <td>
                <span :class="getBadgeClass(PorEjecPresupuesto(dependencia))">
                  {{ PorEjecPresupuesto(dependencia) }}%
                </span>
                <div :class="getTextClass(PorEjecPresupuesto(dependencia))">
                  {{ getMensajeAvance(PorEjecPresupuesto(dependencia)) }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <export-buttons-vue />

    <!-- Campo de búsqueda -->
    <div class="mb-3 text-end">
      <div class="input-group" style="max-width: 300px; margin-left: auto;">
        <input v-model="searchQuery" type="text" class="form-control" placeholder="Buscar en la tabla..." />
        <span class="input-group-text">
          <i class="fas fa-search"></i>
        </span>
      </div>
    </div>

    <!-- Tabla con detalles -->
    <table ref="table" class="table">
      <thead>
        <!-- Fila de totales
        <tr v-if="filteredActividades.length > 0">
          <td colspan="2" class="text-center"><strong>Total:</strong></td>
          <td></td>
          <td>{{ totalSumaProgFisica }}</td>
          <td>{{ totalSumaReproFisica }}</td>
          <td>{{ totalSumaEjecFisica }}</td>
          <td>{{ totalPorEjecAvance }}%</td>
          <td>{{ totalProgPptoAnual }}</td>
          <td>{{ totalReproPptoAnual }}</td>
          <td>{{ totalEjecPptoAnual }}</td>
          <td>{{ totalPorPPTO_AVANCE }}%</td>
          <td colspan="2" class="text-center"><strong>EJECUCIÓN</strong></td>
        </tr>
 -->
        <tr>
          <td colspan="3" v-if="isStaff || (isSuperuser && !isStaff)" class="text-center"><strong></strong></td>
          <td colspan="2" v-else class="text-center"><strong></strong></td>
          <td colspan="3" v-if="isStaff || (isSuperuser && !isStaff)" class="text-center"><strong>Física</strong></td>
          <td colspan="4" v-else class="text-center"><strong>Física</strong></td>
          <td colspan="4" v-if="isStaff || (isSuperuser && !isStaff)" class="text-center"><strong>Presupuestal</strong>
          </td>
          <td colspan="2" v-else class="text-center"><strong>Presupuestal</strong></td>
          <td colspan="3" v-if="isStaff || (isSuperuser && !isStaff)" class="text-center"><strong>Ejecución</strong>
          </td>
          <td colspan="2" v-else class="text-center"><strong>Ejecución</strong></td>

        </tr>
        <tr>
          <th scope="col">N°</th>
          <th v-if="isStaff || (isSuperuser && !isStaff)">Estado</th>
          <th>Actividad Operativa</th>
          <th v-if="isStaff || (isSuperuser && !isStaff)">Prog.</th>
          <th>Reprog.</th>
          <th>Ejec.</th>
          <th>% Ejec.</th>
          <th v-if="isStaff || (isSuperuser && !isStaff)">Prog.</th>
          <th>Reprog.</th>
          <th>Ejec.</th>
          <th>% Ejec.</th>
          <th>Física</th>
          <th>Presupuestal</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(actividad, index) in filteredActividades" :key="actividad.id">
          <td>{{ index + 1 }}</td>
          <td v-if="isStaff || (isSuperuser && !isStaff)">
            <span :class="{
              'badge': true,
              'bg-success': actividad.estado,
              'bg-danger': !actividad.estado
            }">
              {{ actividad.estado ? 'Activo' : 'Inactivo' }}
            </span>
          </td>
          <td>{{ actividad.name }}</td>
          <td v-if="isStaff || (isSuperuser && !isStaff)">{{ actividad.suma_prog_fisica || 0 }}</td>
          <td>{{ actividad.suma_repro_fisica || 0 }}</td>
          <td>{{ actividad.suma_ejec_fisica || 0 }}</td>
          <td>
            <span :class="getBadgeClass(actividad.PorEjecAvance)">
              {{ actividad.PorEjecAvance }}%
            </span>
            <div :class="getTextClass(actividad.PorEjecAvance)">
              {{ getMensajeAvance(actividad.PorEjecAvance) }}
            </div>
          </td>
          <td v-if="isStaff || (isSuperuser && !isStaff)">{{ actividad.PROG_PPTO_ANUAL || 0 }}</td>
          <td>{{ actividad.REPRO_PPTO_ANUAL || 0 }}</td>
          <td>{{ actividad.EJEC_PPTO_ANUAL || 0 }}</td>
          <td>
            <span :class="getBadgeClass(actividad.POR_PPTO_AVANCE)">
              {{ actividad.POR_PPTO_AVANCE }}%
            </span>
            <div :class="getTextClass(actividad.POR_PPTO_AVANCE)">
              {{ getMensajeAvance(actividad.POR_PPTO_AVANCE) }}
            </div>
          </td>
          <td>
            <button @click.stop="goToTareas(actividad.id)" class="btn btn-danger"><i
                class="fa-solid fa-pen-to-square"></i></button>
          </td>
          <td>
            <button @click="goToActividadDetalle(actividad.id)" class="btn btn-warning"><i
                class="fa-solid fa-pen-to-square"></i></button>
          </td>
        </tr>
      </tbody>
    </table>
  </main>
</template>


<script setup>
import ExportButtonsVue from '../../components/buttons/ExportButtons.vue';
import api from '../../components/axios';

import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// Definición de variables
const actividades = ref([]);
const dependenciaCounts = ref({});
const SUM_TAREA_REPORT = ref({});
const SUM_ACTIVIDAD_REPORT = ref({});
const tareaCounts = ref({});
const searchQuery = ref('');
// Definir las variables reactivas
const isSuperuser = ref(false);
const isStaff = ref(false);


const router = useRouter();

const goToTareas = (actividadId) => {
  router.push({ name: 'actividad-tareas', params: { id: actividadId } });
};

const goToActividadDetalle = (actividadId) => {
  router.push({ name: 'actividad-reportes', params: { id: actividadId } });
};
const getAuthToken = () => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.error('No se encontró el token de autenticación.');
    throw new Error('Token de autenticación no encontrado');
  }
  return token;
};

onMounted(async () => {
  const accessToken = getAuthToken();
  if (!accessToken) {
    console.error('No se encontró el token de autenticación.');
    return;
  }

  try {
    const response = await api.get('poi/actividad/', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    console.log(response.data); // Añadir este para verificar los datos

    actividades.value = response.data.activities;
    dependenciaCounts.value = response.data.dependencia_counts;
    SUM_TAREA_REPORT.value = response.data.SUM_TAREA_REPORT;
    SUM_ACTIVIDAD_REPORT.value = response.data.SUM_ACTIVIDAD_REPORT;
    tareaCounts.value = response.data.tarea_counts;
  } catch (error) {
    console.error('Error al obtener las actividades:', error.response ? error.response.data : error.message);
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

// Computed property para filtrar las actividades basadas en la búsqueda
const filteredActividades = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return actividades.value.filter(actividad => {
    return (
      actividad.codigo.toLowerCase().includes(query) ||
      actividad.name.toLowerCase().includes(query)
    );
  });
});

// Propiedades computadas para los totales
const totalSumaProgFisica = computed(() => {
  return filteredActividades.value.reduce((total, actividad) => total + (actividad.suma_prog_fisica || 0), 0);
});

const totalSumaReproFisica = computed(() => {
  return filteredActividades.value.reduce((total, actividad) => total + (actividad.suma_repro_fisica || 0), 0);
});

const totalSumaEjecFisica = computed(() => {
  return filteredActividades.value.reduce((total, actividad) => total + (actividad.suma_ejec_fisica || 0), 0);
});

const totalProgPptoAnual = computed(() => {
  return filteredActividades.value.reduce((total, actividad) => total + (actividad.PROG_PPTO_ANUAL || 0), 0);
});

const totalReproPptoAnual = computed(() => {
  return filteredActividades.value.reduce((total, actividad) => total + (actividad.REPRO_PPTO_ANUAL || 0), 0);
});

const totalEjecPptoAnual = computed(() => {
  return filteredActividades.value.reduce((total, actividad) => total + (actividad.EJEC_PPTO_ANUAL || 0), 0);
});

const totalPorEjecAvance = computed(() => {
  const totalRepro = totalSumaReproFisica.value;
  const totalEjec = totalSumaEjecFisica.value;
  if (totalRepro === 0) return 0;
  // Redondea a dos decimales usando toFixed y luego convierte a número
  return Number(((totalEjec / totalRepro) * 100).toFixed(2));
});

const totalPorPPTO_AVANCE = computed(() => {
  const totalRepro = totalReproPptoAnual.value;
  const totalEjec = totalEjecPptoAnual.value;
  if (totalRepro === 0) return 0;
  // Redondea a dos decimales usando toFixed y luego convierte a número
  return Number(((totalEjec / totalRepro) * 100).toFixed(2));
});

const PorEjecFisica = (dependencia) => {
  const totalEjec = SUM_TAREA_REPORT.value[dependencia]?.total_ejec_fisica || 0;
  const totalRepro = SUM_TAREA_REPORT.value[dependencia]?.total_repro_fisica || 1; // Evita la división por cero
  return ((totalEjec / totalRepro) * 100).toFixed(2);
};

const PorEjecPresupuesto = (dependencia) => {
  const totalEjec = SUM_ACTIVIDAD_REPORT.value[dependencia]?.total_ejec_ppto || 0;
  const totalRepro = SUM_ACTIVIDAD_REPORT.value[dependencia]?.total_repro_ppto || 1; // Evita la división por cero
  return ((totalEjec / totalRepro) * 100).toFixed(2);
};


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
