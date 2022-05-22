/**
 * ## mailRecoverPassword - HTML
 * @param {Object} params
 * @returns HTML
 */
export const mailRecoverPassword = ({
  name,
  enlace,
  token,
}) => `<table border="0" width="100%" height="100%" style="font-family: verdana;">
<tr><td align="center" valign="center">
<table width="300" border="0">
	<tr><td align="center" valign="top" height="120"><img src="https://mirent-api-luissg.herokuapp.com/img/mirent-logo.png" alt="" width="200"></td></tr>
	<tr><td align="center" valign="center"><h1 style="margin:0px;">Hola ${name}</h1></td></tr>
	<tr><td align="center" valign="center"><h2 style="margin:0px;">¿Olvidaste tu contraseña?</h2></td></tr>
	<tr><td align="center" valign="center"><p style="font-size: 14px;">No te preocupes, puedes restablecer tu contraseña de <b>miRent</b> haciendo click en el siguiente enlace:</p></td></tr>
	<tr><td align="center" valign="center" height="100"><p style="font-size: 14px;">
		<a href="${enlace}/${token}" target="_blank" style="background: #29E58B;padding: 15px 0;border-radius: 10px;color:#455A64;width:100%; display: inline-block;text-decoration: none;" >Restablecer mi contraseña</a>
	</p></td></tr>
	<tr><td align="center" valign="center"><p style="font-size: 14px;">Si recibiste este mensaje por error, ignora este correo electrónico.</p></td></tr>
</table>
</td></tr>
<tr><td align="center" valign="center" bgcolor="#455A64" height="50"><p style="font-size: 12px; color:#fff">El equipo de <b>miRent</b></p></td></tr>
</table>`;
