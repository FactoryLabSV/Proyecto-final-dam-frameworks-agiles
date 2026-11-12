<template>
  <v-app>
    <!-- 1. Barra superior (App Bar) -->
    <v-app-bar app color="#F4F6F9" elevation="1">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>{{ currentTitle }}</v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- Etiqueta o botón de rol dinámico -->
      <v-btn id="menu-activator" prepend-icon="mdi-account-circle" color="primary">
        {{ userRoleText }}
      </v-btn>

      <!-- Menú desplegable de Perfil / Logout -->
      <v-menu activator="#menu-activator">
        <v-list>
          <v-list-item 
            v-for="(logoutItem, index) in logouts" 
            :key="index" 
            :prepend-icon="logoutItem.icon" 
            color="primary"
            @click="manejarAccion(logoutItem.value)"
          >
            <v-list-item-title>{{ logoutItem.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- 2. Menú Lateral Dinámico por Rol -->
    <v-navigation-drawer app color="#0873C4" v-model="drawer">
      <!-- Logo -->
      <v-list>
        <v-list-item>
          <v-img src="@/assets/tamachihua/tamachihua-logo-horizontal-blanco.png" alt="Logo Tamachihua" id="logo"></v-img>
        </v-list-item>
      </v-list>

      <!-- Dashboard (Común para todos) -->
      <v-list density="compact" nav>
        <v-list-item
          prepend-icon="mdi-home"
          title="Dashboard"
          to="/inicio"
          id="v-list-item1"
        ></v-list-item>
      </v-list>

      <!-- SECCIÓN: PRODUCTOS -->
      <template v-if="filteredProductos.length > 0">
        <v-divider></v-divider>
        <v-list-item><b>PRODUCTOS</b></v-list-item>
        <v-divider></v-divider>
        <v-list density="compact" nav>
          <v-list-item
            v-for="item in filteredProductos"
            :key="item.value"
            :prepend-icon="item.icon"
            :title="item.title"
            :to="item.path"
            id="v-list-item1"
          ></v-list-item>
        </v-list>
      </template>

      <!-- SECCIÓN: INVENTARIO -->
      <template v-if="filteredInventario.length > 0">
        <v-divider></v-divider>
        <v-list-item><b>INVENTARIO</b></v-list-item>
        <v-divider></v-divider>
        <v-list density="compact" nav>
          <v-list-item
            v-for="item in filteredInventario"
            :key="item.value"
            :prepend-icon="item.icon"
            :title="item.title"
            :to="item.path"
            id="v-list-item1"
          ></v-list-item>
        </v-list>
      </template>

      <!-- SECCIÓN: PROVEEDORES -->
      <template v-if="filteredProveedores.length > 0">
        <v-divider></v-divider>
        <v-list-item><b>PROVEEDORES</b></v-list-item>
        <v-divider></v-divider>
        <v-list density="compact" nav>
          <v-list-item
            v-for="item in filteredProveedores"
            :key="item.value"
            :prepend-icon="item.icon"
            :title="item.title"
            :to="item.path"
            id="v-list-item1"
          ></v-list-item>
        </v-list>
      </template>

      <!-- SECCIÓN: SEGURIDAD -->
      <template v-if="filteredSeguridad.length > 0">
        <v-divider></v-divider>
        <v-list-item><b>SEGURIDAD</b></v-list-item>
        <v-divider></v-divider>
        <v-list density="compact" nav>
          <v-list-item
            v-for="item in filteredSeguridad"
            :key="item.value"
            :prepend-icon="item.icon"
            :title="item.title"
            :to="item.path"
            id="v-list-item1"
          ></v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>

    <!-- 3. Contenedor Principal de Vistas -->
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const drawer = ref(true);
const route = useRoute();
const router = useRouter();

// Obtener usuario del localStorage para definir permisos
const userStored = localStorage.getItem('user');
const user = userStored ? JSON.parse(userStored) : null;
const currentRole = user?.role || 'ADMIN'; // 'ADMIN', 'BODEGA', 'COMPRAS'

const userRoleText = computed(() => {
    switch(currentRole) {
      case 'ADMIN': return 'Administrador';
      case 'WAREHOUSE': return 'Bodega';
      case 'PURCHASING': return 'Compras';
      default: return 'Usuario';
    }
});

// Listados con los roles permitidos exactos según tu diseño de la imagen
const productosItems = [
  { icon: 'mdi-package-variant-closed', title: 'Productos', value: 'Productos', path: '/productos', roles: ['ADMIN', 'WAREHOUSE', 'PURCHASING'] },
  { icon: 'mdi-tag', title: 'Categorias', value: 'Categorias', path: '/categorias', roles: ['ADMIN'] },
  { icon: 'mdi-trademark', title: 'Marcas', value: 'Marcas', path: '/marcas', roles: ['ADMIN'] },
  { icon: 'mdi-layers', title: 'Modelos', value: 'Modelos', path: '/modelos', roles: ['ADMIN'] },
  { icon: 'mdi-package-variant', title: 'Presentaciones', value: 'Presentaciones', path: '/presentaciones', roles: ['ADMIN', 'WAREHOUSE', 'PURCHASING'] },
  { icon: 'mdi-ruler', title: 'Unidades de medida', value: 'Unidades de medida', path: '/unidades-medida', roles: ['ADMIN'] },
];

const inventarioItems = [
  { icon: 'mdi-dolly', title: 'Lotes', value: 'Lotes', path: '/lotes', roles: ['ADMIN', 'WAREHOUSE', 'PURCHASING'] },
];

const proveedoresItems = [
  { icon: 'mdi-truck', title: 'Proveedores', value: 'Proveedores', path: '/proveedores', roles: ['ADMIN', 'PURCHASING'] },
];

const seguridadItems = [
  { icon: 'mdi-account-group', title: 'Usuarios', value: 'Usuarios', path: '/usuarios', roles: ['ADMIN'] },
];

// Propiedades computadas que filtran los elementos según el rol actual del usuario
const filteredProductos = computed(() => productosItems.filter(i => i.roles.includes(currentRole)));
const filteredInventario = computed(() => inventarioItems.filter(i => i.roles.includes(currentRole)));
const filteredProveedores = computed(() => proveedoresItems.filter(i => i.roles.includes(currentRole)));
const filteredSeguridad = computed(() => seguridadItems.filter(i => i.roles.includes(currentRole)));

const logouts = [
  { icon: 'mdi-account', title: 'Perfil', value: 'Perfil' },
  { icon: 'mdi-logout', title: 'Cerrar sesión', value: 'Cerrar sesión' },
];

const manejarAccion = (value) => {
    if (value === 'Perfil') {
        router.push('/perfil');
    } else if (value === 'Cerrar sesión') {
        logout();
    }
};

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
};

const currentTitle = computed(() => {
    return route.meta?.title || 'Módulo de Inventario';
});
</script>

<style scoped>
#v-list-item1 {
    background-color: #00A8FF;
    margin-bottom: 4px;
}

#logo {
    width: 100%; 
    max-height: 40px; 
    object-fit: contain;
    padding: 30px 10px;
}
</style>