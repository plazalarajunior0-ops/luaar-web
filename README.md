# LUAAR · página para el hosting

Landing de LUAAR (velas de cera vegetal, cliente de KVRA). Es un sitio estático: no hay que compilar nada ni montar servidor.

## Ramas
- **`hosting`**: la versión completa para subir al hosting. Trae el pop-up del 10% en la primera compra y el aviso de privacidad.
- **`main`**: es lo que se ve hoy en https://plazalarajunior0-ops.github.io/luaar-web/ (GitHub Pages) y no tiene pop-up. **No unas `hosting` con `main` hasta conectar la clave del pop-up**, porque `main` es la página en vivo que abre el QR del empaque.

## Cómo subirla
Sube a la carpeta pública del dominio (`public_html` en Hostinger) todo esto, sin meterlo en otra carpeta: `index.html`, `privacidad.html`, `luaar.js`, `bienvenida.js` y la carpeta `img/`. El `README.md` y el `.nojekyll` no hacen falta.

## Conectar el pop-up (Web3Forms)
- En `index.html` está la línea `var REGISTRO_CLAVE = "";`. Ahí va la *access key* de Web3Forms. El correo al que llegan los registros lo define Fredy.
- Mientras no tenga clave, el pop-up le avisa a la persona que sus datos no se guardaron y le ofrece WhatsApp. Solo dice «Listo» cuando Web3Forms responde `success: true`.
- Para probarlo, agrega `?bienvenida` al final de la dirección; así el pop-up se abre a la fuerza. Normalmente sale una sola vez por visitante, a los 12 s o al 45 % del scroll.
- Después de poner la clave, haz un registro real desde el dominio final y confirma que llegó el correo.

## No romper el QR del empaque
El QR impreso en el empaque abre https://plazalarajunior0-ops.github.io/luaar-web/. **No borres este repo ni apagues GitHub Pages.** Cuando el dominio nuevo funcione, avísale a Fredy: la página de `main` se cambia por una redirección al dominio nuevo, y así el QR sigue sirviendo.

## Al cambiar de dominio
- La vista previa al compartir el link (WhatsApp, redes) usa `og:image` apuntando a `https://plazalarajunior0-ops.github.io/luaar-web/img/og-luaar.jpg`. Con el dominio definitivo, cámbiala a la dirección del dominio y agrega `og:url` y `canonical`.
- El dominio que escogió Fredy es **velasluaar.com**. Al 4 de noviembre de 2026 todavía no estaba comprado.

## Datos de la página
- WhatsApp: +57 300 765 2947. Instagram: @luaar__ilumina.
- El enlace de TikTok está escondido a propósito hasta que exista la cuenta.

## Revisión (4 de noviembre de 2026)
Sin errores en la consola, ninguna imagen rota y sin scroll hacia los lados a 375 px y a 1366 px. El pop-up está probado en celular y en computador; sin clave muestra el aviso de «no conectado» y no envía nada. El aviso de privacidad abre bien.
