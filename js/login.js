(function () {
    // 1. REFERENCIAS AL DOM
    const form = document.getElementById('formLogin');
    const usuario = document.getElementById('usuario');
    const contrasena = document.getElementById('contrasena');
    const rol = document.getElementById('rol');

    const errUsuario = document.getElementById('errUsuario');
    const errContrasena = document.getElementById('errContrasena');
    const errRol = document.getElementById('errRol');
    
    const mensaje = document.getElementById('mensaje');
    const togglePwd = document.getElementById('togglePwd');

    // 2. CONFIGURACIÓN DE CREDENCIALES (Base de datos local simulada)
    const CREDS = {
        estudiante: { email: 'e@live.uleam.edu.ec', pass: '123' },
        admin:      { email: 'admin@live.uleam.edu.ec', pass: '123' }
    };

    // Al cargar la página, limpiamos sesiones previas para evitar errores de caché
    localStorage.removeItem('sesionRol');
    localStorage.removeItem('sesionEmail');

    // 3. UTILIDADES DE INTERFAZ
    // Mostrar/Ocultar contraseña
    togglePwd?.addEventListener('click', () => {
        const isPwd = contrasena.type === 'password';
        contrasena.type = isPwd ? 'text' : 'password';
        togglePwd.textContent = isPwd ? '🙈' : '👁️';
    });

    // Manejo de errores visuales
    function setError(input, errNode, msg) {
        input.classList.add('is-invalid');
        errNode.textContent = msg;
    }

    function clearErrors() {
        [usuario, contrasena, rol].forEach(el => el.classList.remove('is-invalid'));
        [errUsuario, errContrasena, errRol].forEach(el => el.textContent = '');
        mensaje.textContent = '';
    }

    // 4. PROCESO DE VALIDACIÓN E INGRESO
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors();

        let ok = true;

        // Captura de valores
        const email = usuario.value.trim().toLowerCase();
        const pass  = contrasena.value.trim();
        const role  = rol.value;

        // Validaciones de campos obligatorios
        if (!email) {
            setError(usuario, errUsuario, 'Ingresa tu correo institucional.');
            ok = false;
        }
        if (!pass) {
            setError(contrasena, errContrasena, 'La contraseña es obligatoria.');
            ok = false;
        }
        if (!role) {
            setError(rol, errRol, 'Selecciona un rol de acceso.');
            ok = false;
        }

        if (!ok) return;

        // Verificación de credenciales contra el objeto CREDS
        const esperado = CREDS[role];

        if (!esperado || email !== esperado.email || pass !== esperado.pass) {
            mensaje.style.color = 'var(--amarillo)';
            mensaje.textContent = '❌ Credenciales incorrectas para el rol seleccionado.';
            
            // Marcamos los campos en rojo para feedback visual
            usuario.classList.add('is-invalid');
            contrasena.classList.add('is-invalid');
            return;
        }

        // 5. ACCESO CONCEDIDO
        mensaje.style.color = 'var(--verde-ok)';
        mensaje.textContent = `✅ Acceso correcto como ${role.toUpperCase()}. Redirigiendo...`;

        // Guardar datos en LocalStorage para usarlos en las otras páginas
        localStorage.setItem('sesionRol', role);
        localStorage.setItem('sesionEmail', email);
        
        // Extraemos la cédula o ID (lo que esté antes del @)
        const cedulaSimulada = email.split('@')[0];
        localStorage.setItem('sesionCedula', cedulaSimulada);

        // Desactivamos el botón para evitar múltiples clics
        const btn = form.querySelector('button[type="submit"]');
        if (btn) btn.disabled = true;

        // Redirección controlada
        setTimeout(() => {
            if (role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'estudiante.html';
            }
        }, 1200);
    });

    console.log("🚀 Sistema de Login ULEAM cargado y listo.");
})();