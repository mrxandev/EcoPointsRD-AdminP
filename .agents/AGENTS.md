# Instrucciones para agentes IA en EcoPoints RD Admin Panel

Este proyecto debe mantenerse con una arquitectura limpia, consistente y fácil de mantener.

## Reglas generales

- Revisar la estructura existente antes de crear archivos.
- No cambiar la arquitectura sin necesidad.
- No inventar endpoints.
- Usar Axios para todas las peticiones HTTP.
- Usar Tailwind CSS para estilos.
- No usar fetch directamente en componentes.
- No instalar dependencias nuevas sin justificación.
- No dejar mock data si existe endpoint real.
- No crear diseños genéricos con apariencia de IA.
- Mantener microcopy en español.
- Proteger rutas administrativas con JWT y role ADMIN.

## API

- Centralizar Axios en un cliente reutilizable.
- Usar baseURL desde variable de entorno.
- Agregar Authorization Bearer token automáticamente.
- Manejar errores 401, 403 y 500.
- Separar servicios por dominio: usuarios, misiones, recompensas, canjes, transacciones y estadísticas.

## UI

El panel debe ser sobrio, administrativo y funcional.

Evitar:
- gradientes exagerados
- emojis innecesarios
- sombras excesivas
- colores saturados
- cards genéricas
- textos artificiales

Usar:
- sidebar
- header simple
- tablas claras
- filtros
- paginación
- estados loading
- estados vacíos
- confirmaciones
- formularios accesibles
- badges de estado

## Calidad

Antes de terminar cualquier tarea:
- revisar imports
- ejecutar build si existe
- ejecutar lint si existe
- eliminar código muerto
- documentar endpoints faltantes