# Sistema de Gestión de Limpieza y Mantenimiento

Una plataforma web completa para digitalizar el registro de actividades de limpieza y el reporte de incidentes en instituciones.

## Características Principales

### Para Personal de Limpieza
- **Inicio de sesión seguro** con autenticación basada en JWT
- **Registro de actividades de limpieza** con formulario digital que incluye:
  - Selección de área (bloque, piso, tipo de baño)
  - Registro automático de fecha y hora
  - Checkboxes para áreas limpiadas (sanitarios, lavamanos, espejos, paredes, pisos, puertas)
  - Checkboxes para suministros reabastecidos (papel higiénico, toallas, jabón)
  - Carga de evidencia fotográfica o video
  - Campo de notas adicionales
- **Reporte de incidentes** con:
  - Descripción detallada del problema
  - Clasificación por prioridad (baja, media, alta)
  - Evidencia visual (foto/video)
  - Ubicación específica del incidente

### Para Administradores/Supervisores
- **Panel de control administrativo** con métricas en tiempo real
- **Dashboard de incidentes** que muestra:
  - Lista completa de incidentes reportados
  - Filtros por estado y prioridad
  - Vista detallada de cada incidente con evidencia
  - Estadísticas de incidentes por estado
- **Historial de limpieza** con:
  - Registro completo de todas las actividades
  - Evidencia fotográfica/video de cada limpieza
  - Filtros por personal, fecha y ubicación
  - Métricas de productividad

## Tecnologías Utilizadas

### Frontend
- **Next.js 14** con App Router
- **React 18** con TypeScript
- **Tailwind CSS** para estilos
- **shadcn/ui** para componentes de interfaz
- **Lucide React** para iconografía

### Backend
- **Spring Boot** para API REST
- **JWT** para autenticación segura
- **MySQL** para base de datos

### Características Técnicas
- **Autenticación basada en roles** (personal/administrador)
- **Carga de archivos** con validación de tipo y tamaño
- **Interfaz responsive** optimizada para dispositivos móviles
- **Validación de formularios** en cliente y servidor
- **Manejo de errores** robusto
- **Integración completa con Spring Boot backend**

## Instalación y Configuración

### Prerrequisitos
- Node.js 18 o superior
- Spring Boot backend ejecutándose en puerto 8080
- MySQL 8.0 o superior

### Configuración del Frontend

1. **Clonar el repositorio**
\`\`\`bash
git clone <repository-url>
cd cleaning-platform
\`\`\`

2. **Instalar dependencias**
\`\`\`bash
npm install
\`\`\`

3. **Configurar variables de entorno**
\`\`\`bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api
SPRING_BOOT_API_URL=http://localhost:8080/api
NODE_ENV=development
\`\`\`

4. **Ejecutar en desarrollo**
\`\`\`bash
npm run dev
\`\`\`

## Configuración del Backend Spring Boot

### Estructura de Controladores Recomendada

\`\`\`java
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Implementar autenticación JWT
        // Retornar: { "token": "jwt_token", "user": { "id", "email", "full_name", "role" } }
    }
    
    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        // Crear nuevo usuario
        // Retornar: { "token": "jwt_token", "user": { "id", "email", "full_name", "role" } }
    }
    
    @GetMapping("/auth/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        // Obtener usuario actual desde JWT
        // Retornar: { "user": { "id", "email", "full_name", "role" } }
    }
    
    @PostMapping("/auth/logout")
    public ResponseEntity<?> logout() {
        // Invalidar token si es necesario
        // Retornar: { "message": "Logout successful" }
    }
}

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class CleaningController {
    
    @GetMapping("/bathrooms")
    public ResponseEntity<List<Bathroom>> getBathrooms() {
        // Retornar lista de baños con información de piso y edificio
    }
    
    @PostMapping("/cleaning-activities")
    public ResponseEntity<?> createActivity(@RequestBody CleaningActivity activity) {
        // Guardar actividad de limpieza
    }
    
    @GetMapping("/cleaning-activities")
    public ResponseEntity<List<CleaningActivity>> getActivities() {
        // Retornar historial de actividades
    }
    
    @PostMapping("/incidents")
    public ResponseEntity<?> createIncident(@RequestBody Incident incident) {
        // Reportar incidente
    }
    
    @GetMapping("/incidents")
    public ResponseEntity<List<Incident>> getIncidents() {
        // Retornar lista de incidentes
    }
    
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        // Manejar carga de archivos (imágenes/videos)
        // Retornar: { "url": "file_url", "type": "image|video", "filename": "name", "size": 12345 }
    }
}
\`\`\`

### Entidades JPA Recomendadas

\`\`\`java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String passwordHash;
    
    @Column(nullable = false)
    private String fullName;
    
    @Enumerated(EnumType.STRING)
    private Role role; // CLEANING_STAFF, ADMIN
    
    // getters, setters, constructors
}

@Entity
@Table(name = "cleaning_activities")
public class CleaningActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "bathroom_id")
    private Bathroom bathroom;
    
    @Column(name = "cleaned_at")
    private LocalDateTime cleanedAt;
    
    // Campos booleanos para áreas limpiadas
    private Boolean toiletsCleaned;
    private Boolean sinksCleaned;
    private Boolean mirrorsCleaned;
    private Boolean wallsCleaned;
    private Boolean floorsCleaned;
    private Boolean doorsCleaned;
    
    // Campos booleanos para suministros
    private Boolean toiletPaperRestocked;
    private Boolean paperTowelsRestocked;
    private Boolean soapRestocked;
    
    // Evidencia
    private String evidenceUrl;
    private String evidenceType; // "image" o "video"
    private String notes;
    
    // getters, setters, constructors
}
\`\`\`

### Esquema de Base de Datos

El frontend espera que tu backend Spring Boot maneje las siguientes entidades:

- **users** - Usuarios del sistema (personal de limpieza y administradores)
- **buildings** - Edificios de la institución
- **floors** - Pisos de cada edificio
- **bathrooms** - Baños en cada piso
- **cleaning_activities** - Registro de actividades de limpieza
- **incidents** - Reportes de incidentes

### Configuración CORS

Asegúrate de configurar CORS en tu Spring Boot para permitir requests desde el frontend:

\`\`\`java
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
\`\`\`

## Endpoints API Esperados

El frontend hace llamadas a los siguientes endpoints de tu Spring Boot backend:

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/logout` - Cerrar sesión

### Gestión de Datos
- `GET /api/bathrooms` - Obtener lista de baños
- `GET /api/buildings` - Obtener lista de edificios
- `GET /api/floors` - Obtener lista de pisos
- `GET /api/users` - Obtener lista de usuarios (admin)

### Actividades y Reportes
- `POST /api/cleaning-activities` - Registrar actividad de limpieza
- `GET /api/cleaning-activities` - Obtener historial de actividades
- `POST /api/incidents` - Reportar incidente
- `GET /api/incidents` - Obtener lista de incidentes
- `POST /api/upload` - Subir archivos (evidencia)

## Funcionalidades Adicionales Recomendadas

1. **Notificaciones en tiempo real** (WebSockets)
2. **Reportes y analytics** avanzados
3. **Aplicación móvil** nativa
4. **Integración con sistemas de mantenimiento** existentes
5. **Geolocalización** para verificar ubicación del personal
6. **Códigos QR** en cada baño para acceso rápido
7. **Dashboard ejecutivo** con métricas de rendimiento

## Soporte y Documentación

Este frontend está completamente configurado para consumir tu backend Spring Boot. Asegúrate de que tu backend implemente los endpoints esperados y maneje la autenticación JWT correctamente.
