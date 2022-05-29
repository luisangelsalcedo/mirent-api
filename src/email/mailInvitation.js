/**
 * ## mailInvitation - HTML
 * @param {Object} params
 * @returns HTML
 */
export const mailInvitation = ({
  name,
  enlace,
  user,
}) => `<table border="0" width="100%" height="100%" style="font-family: verdana;">
<tr><td align="center" valign="center">
<table width="400" border="0">
	<tr><td align="center" valign="top" height="120"><img src="https://mirent-api-luissg.herokuapp.com/img/mirent-logo-min.png" alt="" width="200"></td></tr>
	<tr><td align="center" valign="center"><h1 style="margin:0px;">Te damos la Bienvenida</h1></td></tr>
	<tr><td align="center" valign="center"><h2 style="margin:0px;">Tienes una invitación de ${user.name} para usar nuestra plataforma</h2></td></tr>
	<tr><td align="center" valign="center"><p style="font-size: 14px;">Para activar tu usuario debes darle click al siguiente enlace y restablecer tu contraseña. Ya estas a solo unos pasos, estamos felices que seas parte de nosotros.</p></td></tr>
	<tr><td align="center" valign="center" height="100"><p style="font-size: 14px;">
		<a href="${enlace}" target="_blank" style="background: #29E58B;padding: 15px 0;border-radius: 10px;color:#455A64;width:100%; display: inline-block;text-decoration: none;" >Restablecer mi contraseña</a>
	</p></td></tr>
	<tr><td align="center" valign="center"><p style="font-size: 14px;">Si recibiste este mensaje por error, ignora este correo electrónico.</p></td></tr>
</table>
</td></tr>
<tr><td align="center" valign="center" bgcolor="#455A64" height="50"><p style="font-size: 12px; color:#fff">El equipo de <b>miRent</b></p></td></tr>
</table>`;
