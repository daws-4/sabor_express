# El siguiente proyecto busca ser una aplicación multiplataforma que permita conectar a los usuarios vendedores con los usuarios compradores de manera segura y eficiente.

# El proyecto se basa en la creación de un sistema de gestión de pedidos, donde los vendedores pueden subir sus productos y los compradores pueden manejar sus pedidos a través de la misma aplicación. Además de contar con usuarios delivery encargados de entregar los pedidos a los compradores y gestionar el dinero dado en efectivo.

# Se espera que la aplicación cuente con 5 interfaces principales.

 - web master: donde los usuarios administradores pueden gestionar todos las bodegas inscritas, los estados de cuenta, hacer soporte técnico y gestionar a los mototaxistas registrados para la aplicación, todo de estar seccionado por estados del país para futura escalabilidad, además de existir admins por región y súper admins nacionales.


 - Web: donde los usuarios vendedores pueden registrarse y administrar sus productos desde ahí.


 - Mobile Seller: donde los usuarios vendedores pueden iniciar sesión y administrar sus productos desde ahí.


 - Mobile Customer: donde los usuarios compradores pueden registrarse, iniciar sesión y manejar sus pedidos desde ahí.


 - Mobile Delivery: donde los usuarios delivery pueden iniciar sesión, recibir pedidos, gestionar dinero y enviar datos en tiempo real de su ubicación mientras se realiza el delivery.

 ##### --------  LISTA DE FUNCIONES DE CADA APARTADO DE LA APLICACIÓN  ---------  ######

 # Web Master: 
 - Crear, editar y eliminar usuarios vendedores (bodegas). [CRUD] --TERMINADO--
 - Crear, editar y eliminar usuarios. [CRUD]
 - Crear, editar y eliminar usuarios delivery. [CRUD] --TERMINADO--
 - Aceptar o rechazar solicitudes de registro de usuarios vendedores (bodegas). [POST] --TERMINADO--
 - Verificar estados de cuenta de los usuarios vendedores (bodegas). [GET] 
 - Verificar estados de cuenta de los usuarios. [GET]
 - Verificar las entregas de los usuarios delivery. [GET]
 - Verificar los estados de cuenta de los usuarios delivery. [GET]
 - Verificar pedidos de los usuarios compradores. [GET]
 - Ver datos de ingresos y gastos (pagos) de la aplicación. [GET] --TERMINADO--
 - Ver estadísticas de usuarios y ventas en diferentes escalas. [GET] --TERMINADO--
 - Autogestión de olvido de usuario o clave. [POST] 
 
- Definir la base de datos de la información a usar de:
    - Usuarios administradores:  --TERMINADO--
        - nombre de usuario
        - contraseña
        - ciudad asignada
        - rol
    - Usuarios vendedores: --TERMINADO--
    - Usuarios compradores: 
        - cédula de identidad
        - correo electrónico
        - número de teléfono
        - contraseña
        - nombre1
        - nombre2
        - nombre3
        - apellido1
        - apellido2
        - apellido3
        - fecha de nacimiento
        - [ubicaciones guardadas]
        - [información del juego]
    - Usuarios delivey:
        - cédula identidad
        - nombre1
        - nombre2
        - nombre3
        - apellido1
        - apellido2
        - apellido3
        - número de telefono
        - correo electronico
        - contraseña
        - ciudad
        - placa
        - tipo de vehiculo [moto / carro]
      

 # Web: 
 - Autogestión de ingreso de usuarios vendedores (bodegas). [CRUD] --TERMINADO--
    - Ingreso de datos de usuario vendedor (bodega). [CRUD] --TERMINADO--
        - Información fiscal, datos de contacto, ubicación, datos del negocio, datos del representante del negocio, método de pago, información del método de pago, etc... -- TERMIANDO--
    - Inicio de Sesión del usuario vendedor(bodega) -- TERMINADO--
    - Información Pública del negocio (bodega). [CRUD] 
        - Información de la bodega, descripción, ubicación, horarios de atención, redes sociales,  etc... --TERMINADO--
        - Imágenes de la bodega.
        - Lista de productos, descripción, precio, imagen, etc...
        - Lista de Combos, descripción, precio, imagen y productos incluidos etc...
        - Métodos de pago aceptados por el negocio (Efectivo, BsD, Bancolombia, Zelle, Zinli, etc...) --TERMINADO--
    - Estado de cuenta del usuario vendedor  [GET]  
        - Total dinero generado en ventas
        - Total dinero pagado en impuestos ??
        - Total productos vendidos (individual y en combo)
        - Total dinero por cada método de pago
        - Total dinero a débitar por cada delivery hecho (opciones disponibles:
            - si el pago es en efectivo, se debita personalmente
            - si el pago es digital, se puede debitar personalmente al momento del delivery o se puede llevar junto con el pago total mensual de la aplicación)
        - total dinero a pagar por el uso de la aplicación.

# Mobile Seller:
- Inicio de Sesión del usuario vendedor(bodega)
- Información Pública del negocio (bodega). [CRUD]
    - Información de la bodega, descripción, ubicación, horarios de atención, redes sociales,  etc...
    - Imágenes de la bodega.
    - Lista de productos, descripción, precio, imagen, etc...
    - Lista de Combos, descripción, precio, imagen y productos incluidos etc...
    - Métodos de pago aceptados por el negocio (Efectivo, BsD, Bancolombia, Zelle, Zinli, etc...)
- Transacción p2p entre vendedor y comprador por el producto acordado. 
    - solicitud de transacción del comprador al vendedor.
    - una vez aceptada por el vendedor, se establece el monto y el método de pago.
    - se espera a la confirmación del comprador bien sea en efectivo o transferencia.
    - una vez confirmada la transacción, se cierra la compra y se debe ejecutar el pedido.
    - asignación automática de la persona encargada de a hacer el delivery

# Mobile Customer
- Juego de preguntas, retos, uno, pvsp
- limitar cada juego y el desbloqueo de cada uno de ellos por puntos que se deben obtener haciendo compras a través de la aplicación o en su defecto por una mensualidad pagada por el usuario
- Información de los compradores [CRUD]
    - editar correo electronico, número de teléfono, contraseña y ubicaciones
- Método de navegación a través de la app
    - listado de las tiendas cercanas a la ubicación actual y mapa cerrado en base al estado
    - filtrado de la lista en base a productos, precios, promociones y combos
- Método de compra p2p
    - carrito de compras de cada uno de los productos seleccionados limitado a una sola tienda por compra 
    - transacción p2p entre el comprador y el vendedor
    

# Mobile Delivery

La interfaz Mobile Delivery debe contar con las siguientes funciones principales:

- **Inicio de sesión y autenticación:** Permitir que los usuarios delivery inicien sesión de forma segura.
- **Recepción de pedidos asignados:** Visualizar en tiempo real los pedidos disponibles y/o asignados para entrega.
- **Aceptación o rechazo de pedidos:** Permitir aceptar o rechazar pedidos asignados.
- **Visualización de detalles del pedido:** Mostrar información relevante del pedido, incluyendo productos, dirección de entrega, datos del comprador y del vendedor.
- **Navegación y rutas:** Integración con mapas para mostrar la mejor ruta hacia el destino de entrega.
- **Compartir ubicación en tiempo real:** Enviar la ubicación actual del delivery a través de socket.io mientras se realiza la entrega, permitiendo que el sistema y los usuarios puedan rastrear el pedido en tiempo real.
- **Confirmación de entrega:** Permitir al delivery confirmar la entrega del pedido (con opción de foto, firma o código de confirmación).
- **Gestión de pagos:** Visualizar el estado de los pagos recibidos en efectivo o digitales, y registrar la recepción del pago si aplica.
- **Asignación automática de comisiones:** Calcular y asignar automáticamente la comisión correspondiente al delivery por cada pedido entregado exitosamente.
- **Historial de entregas:** Consultar el historial de pedidos entregados, comisiones generadas y pagos recibidos.
- **Soporte y ayuda:** Acceso a soporte técnico o ayuda en caso de inconvenientes durante la entrega.
- **Notificaciones push:** Recibir notificaciones en tiempo real sobre nuevos pedidos, cambios de estado y mensajes importantes.

Estas funciones aseguran una gestión eficiente, segura y transparente de las entregas y las comisiones para los usuarios delivery.















[VERSION2.0]













# Proyecto: Plataforma Multiplataforma de Gestión de Pedidos y Entregas

Este proyecto tiene como objetivo crear una **aplicación multiplataforma** que conecte de manera **segura y eficiente** a vendedores, compradores y repartidores (delivery), permitiendo la gestión integral de pedidos, productos, entregas y pagos.

---

## Estructura de la Aplicación

La plataforma está compuesta por **cinco interfaces principales**, cada una diseñada para cubrir necesidades específicas de los distintos tipos de usuarios:

---

### 1. **Web Master**

**Propósito:**  
Administrar y supervisar toda la operación de la plataforma a nivel nacional y regional.

**Funciones principales:**
- **Gestión de usuarios:** Crear, editar y eliminar vendedores, compradores y repartidores (CRUD).
- **Aprobación de registros:** Aceptar o rechazar solicitudes de nuevos vendedores.
- **Supervisión financiera:** Verificar estados de cuenta de vendedores, compradores y repartidores.
- **Monitoreo de entregas:** Consultar entregas realizadas y pendientes.
- **Estadísticas y reportes:** Acceso a datos de ingresos, gastos y ventas, segmentados por región y usuario. 
- **Gestión de roles:** Soporte para admins regionales y súper admins nacionales.
- **Soporte técnico:** Autogestión de recuperación de usuario o clave.

**Base de datos sugerida:**
- **Usuarios administradores:** usuario, contraseña, ciudad asignada, rol.
- **Usuarios vendedores:** datos fiscales, contacto, ubicación, negocio, representante, métodos de pago.
- **Usuarios compradores:** cédula, correo, teléfono, contraseña, nombres, apellidos, fecha de nacimiento, ubicaciones guardadas, información de juegos.
- **Usuarios delivery:** cédula, nombres, apellidos, teléfono, correo, contraseña, ciudad, placa, tipo de vehículo.

---

### 2. **Web Vendedor**

**Propósito:**  
Permitir a los vendedores gestionar su tienda, productos y ventas.

**Funciones principales:**
- **Registro y gestión de cuenta:** CRUD de datos fiscales, contacto, ubicación y métodos de pago.
- **Gestión de productos y combos:** Crear, editar y eliminar productos y combos, incluyendo imágenes y descripciones.
- **Visualización pública:** Mostrar información de la tienda, horarios, ubicación y redes sociales.
- **Gestión de ventas:** Ver estado de cuenta, ventas totales, productos vendidos, ingresos por método de pago y comisiones por delivery.
- **Gestión de pagos:** Control de pagos recibidos y pendientes, tanto en efectivo como digitales.
- **Transacción p2p:** Solicitud, aceptación y confirmación de pagos entre comprador y vendedor, con cierre automático del pedido y asignación de delivery.

---

### 3. **Mobile Seller**

**Propósito:**  
Ofrecer a los vendedores una versión móvil para gestionar su tienda y ventas desde cualquier lugar.

**Funciones principales:**
- **Inicio de sesión seguro.**
- **Gestión de tienda:** CRUD de información, productos, combos y métodos de pago.
- **Transacciones p2p:** Flujo completo de compra-venta y asignación de delivery.

---

### 4. **Mobile Customer**

**Propósito:**  
Facilitar a los compradores la búsqueda, compra y seguimiento de productos y pedidos.

**Funciones principales:**
- **Gamificación:** Juegos (preguntas, retos, uno, pvp) desbloqueables por puntos obtenidos en compras o por suscripción mensual.
- **Gestión de perfil:** CRUD de correo, teléfono, contraseña y ubicaciones.
- **Navegación avanzada:** Listado y mapa de tiendas cercanas, filtrado por productos, precios, promociones y combos.
- **Carrito de compras:** Limitado a una tienda por compra.
- **Transacción p2p:** Compra directa y segura con el vendedor, con métodos de pago flexibles.

---

### 5. **Mobile Delivery**

**Propósito:**  
Optimizar la gestión de entregas y comisiones para los repartidores.

**Funciones principales:**
- **Inicio de sesión y autenticación segura.**
- **Recepción y gestión de pedidos:** Visualización en tiempo real de pedidos asignados, con opción de aceptar o rechazar.
- **Detalles del pedido:** Información completa de productos, direcciones y datos de contacto.
- **Navegación y rutas:** Integración con mapas para optimizar la entrega.
- **Ubicación en tiempo real:** Compartir la ubicación del repartidor mediante socket.io durante la entrega, permitiendo el rastreo en tiempo real por el sistema y los usuarios.
- **Confirmación de entrega:** Validación mediante foto, firma o código.
- **Gestión de pagos:** Registro y visualización de pagos recibidos.
- **Asignación automática de comisiones:** Cálculo y registro automático de la comisión por cada entrega completada.
- **Historial de entregas y comisiones:** Consulta de entregas realizadas y pagos generados.
- **Soporte y ayuda:** Acceso a asistencia técnica en caso de problemas.
- **Notificaciones push:** Alertas en tiempo real sobre nuevos pedidos, cambios de estado y mensajes importantes.

---

## **Ideas Clave y Detalles Adicionales**

- **Seguridad y transparencia:** Todos los procesos de compra, venta y entrega están diseñados para ser auditables y seguros.
- **Escalabilidad:** El sistema está preparado para crecer por regiones y soportar múltiples roles administrativos.
- **Automatización:** La asignación de delivery y comisiones es automática, reduciendo errores y mejorando la eficiencia.
- **Interactividad:** La gamificación incentiva la participación de los compradores y aumenta la retención.
- **Flexibilidad de pagos:** Soporte para múltiples métodos de pago (efectivo, transferencias, plataformas digitales).
- **Rastreo en tiempo real:** El uso de socket.io para compartir la ubicación del delivery mejora la confianza y la experiencia del usuario.
- **Soporte integral:** Cada usuario cuenta con acceso a soporte técnico y autogestión de su cuenta.

---

Estas características aseguran una **gestión eficiente, segura y transparente** de todos los procesos de la plataforma, beneficiando a vendedores, compradores, repartidores y