<template>
    <v-container fluid>
        <v-row justify="center">
            <v-col xs="12" sm="4" md="4">
                <v-card>
                    <v-img src="../assets/tamachihua/tamachihua-logo-horizontal.png" height="150px"></v-img>
                    <v-card-title class="headline">TAMACHIHUA-ERP</v-card-title>
                    <v-card-subtitle class="text-center">Iniciar sesión para continuar</v-card-subtitle>
                    <v-card-text>

                        <v-form>
                            <v-text-field
                                label="Usuario"
                                v-model="usuario.username"
                                required
                            ></v-text-field>

                            <v-text-field
                                label="Contraseña"
                                v-model="usuario.password"
                                type="password"
                                required
                            ></v-text-field>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn prepend-icon="mdi-login" color="#ffffff" @click="login"><b>Ingresar</b></v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const loading = ref(false);

const usuario = ref({
    username: '',
    password: ''
});

const login = async () => {
    // Validaciones básicas vacías
    if (!usuario.value.username || !usuario.value.password) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    try {
        loading.value = true;
        
        // Reemplaza '/api/login' con la ruta real de tu endpoint de autenticación
        const response = await axios.post('/api/auth/login', {
            username: usuario.value.username,
            password: usuario.value.password
        });

        const userData = response.data.user;

        // Verifica si el usuario está inactivo (false)
        if (userData && userData.is_active === false) {
            alert('Tu cuenta se encuentra inactiva. Comunícate con el administrador.');
            return; // Detiene el proceso y evita guardar el token o avanzar
        }

        if (userData && userData.role === 'SELLER')
        {
            alert('Acceso denegado: El perfil de Vendedor (SELLER) no tiene permisos para ingresar al panel administrativo.');
            return; // Detiene el proceso y evita guardar el token o avanzar
        }

        // Asumiendo que tu backend devuelve el token en response.data.token (ajusta según tu API)
        const accessToken = response.data.accessToken;

        if (accessToken) {
            // Guardar el token en el almacenamiento local (el interceptor lo leerá automáticamente)
            localStorage.setItem('token', accessToken);

            localStorage.setItem('user', JSON.stringify(userData));

            // Redirigir a la vista principal o panel de administración
            router.push('/inicio'); // Cambia '/dashboard' por la ruta que necesites
        }

    } catch (error) {
        console.error('Error al iniciar sesión:', error.response?.status);

        if (error.response) {
            const status = error.response.status;
            const mensajeBackend = JSON.stringify(error.response.data || '').toLowerCase();

            if (mensajeBackend.includes('inactivo') || mensajeBackend.includes('disabled') || mensajeBackend.includes('inactive')) {
                alert('Tu cuenta se encuentra inactiva. Comunícate con el administrador.');
            } else if (status === 401 || status === 400) {
                alert('Credenciales incorrectas. Verifica tu usuario y contraseña.');
            } else if (status >= 500) {
                alert('Error en el servidor. Por favor, intenta más tarde.');
            } else {
                alert(`Error en la petición (${status}). Intenta nuevamente.`);
            }

        } else if (error.request) {
            alert('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        } else {
            alert('Ocurrió un error inesperado al procesar la solicitud.');
        }

    } finally {
        loading.value = false;
    }
}

</script>

<style scoped>

.headline {
    font-weight: bold;
    font-size: 24px;
    text-align: center;
}

.v-card {
    margin-top: 50px;
    padding: 50px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.v-card-title {
    display: flex;
    justify-content: center; /* Centra horizontalmente */
    align-items: center;    /* Centra verticalmente */
}

.v-container {
    background-color: #1C71AE;
    min-height: 100vh;
}

.v-btn {
    border: 2px solid rgba(0, 0, 0, 0.1);
    background-color: #00A8FF;
    margin: 0 auto;
    margin-top: 20px;
    border-radius: 5px;
}
</style>
