# desarrollo_web_jose_donoso

## SISTEMA

El sistema está compuesto por dos archivos HTML, 2 CS y 4 JS.

login.HTML (registro de usuario) utiliza login.css, validador_registro.js para validar datos ingresados y select.js para poblar los parámetros con selector.

avistamientos.HTML (registro de avistamientos, listado y métricas) utiliza avistamientos.css, validador_avistamientos.js para validar datos ingresados, actualizar tablas, funciones de inicio de sesion y almacenar datos simulados. Además, utiliza metricas.js para gráficos utilizando librería chart.js y select.js para poblar los parámetros con selector.

## DECISIONES DE DISEÑO

- Opté por guardar los datos relevantes de inicio de sesión en localStorage.
- No se puede ingresar directamente en avistamientos.HTML a menos que haya datos guardados en localStorge con el objetivo que todos los avistamientos ingresados tengan un nombre asignado.
- Utilicé chart.js para gráficos.
- Decidí dejar el formulario para registrar los avistamientos, la lista de avistamientos y los gráficos en un mismo HTML, con el objetivo de utilizar los datos del mismo formulario en la lista y métricas. (de otra forma, tendría que haber guardado los datos en localStorage).
- En validador_avistamientos hay datos simulados de avistamientos y voluntarios. 
