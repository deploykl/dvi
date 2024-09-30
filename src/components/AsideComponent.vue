<template>
    <!-- ======= Sidebar ======= -->
    <aside v-if="!isControlPage" id="sidebar" class="sidebar d-flex flex-column">
        <ul class="sidebar-nav" id="sidebar-nav">
            <li class="nav-item">
                <a class="nav-link" href="#">
                    <i class="bi bi-grid"></i>
                    <span>Dashboard</span>
                </a>
            </li>
            <li class="nav-heading">Pages</li>
            <hr>
            <li class="nav-item">
                <router-link :to="{ name: 'direccion' }" class="nav-link collapsed">
                    <i class="fa-solid fa-user"></i><span>Dirección</span>
                </router-link>
            </li><!-- End Dashboard Nav -->
        </ul>
        <!-- Botón de Logout (al final) -->


    </aside><!-- End Sidebar -->
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router';

const isSuperuser = ref(false)
const isStaff = ref(false)
const userGroup = ref('')
const router = useRouter();
const isControlPage = ref(false); // Variable para controlar la visibilidad del menú

onMounted(() => {
    const superuser = localStorage.getItem('is_superuser');
    const staff = localStorage.getItem('is_staff');
    const group = localStorage.getItem('group') || 'No definido'; // Usa 'No definido' como valor por defecto

    isSuperuser.value = superuser === 'true';
    isStaff.value = staff === 'true';
    userGroup.value = group; // Asigna el valor a `userGroup`

    console.log('Grupo del usuario:', userGroup.value);
    console.log('Superuser:', isSuperuser.value);
    console.log('Staff:', isStaff.value);
});


</script>