import axios from "axios";
import { authorization } from "./functions.js";

let userMock;
let userValid;
let token;

beforeAll(() => {
  axios.defaults.baseURL = "http://localhost:5000";
  userMock = {
    email: `user${Date.now()}@email.com`,
    password: "1234",
    name: "Luis Salcedo",
  };
});
describe("Pruebas de endpoint: Registrar USER", () => {
  const endpoint = `/auth/local/register`;
  // ❌
  it("Error: Registrar con datos vacíos", async () => {
    try {
      await axios.post(endpoint, {});
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(422);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("email: is required");
      expect(data.message).toContain("password: is required");
    }
  });

  // ❌
  it("Error: Registrar correo electrónico no válido", async () => {
    try {
      await axios.post(endpoint, { email: "esto no es un correo" });
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(422);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("invalid email address");
    }
  });

  // ❌
  it("Error: Registrar sin contraseña", async () => {
    try {
      await axios.post(endpoint, { email: "other@email.com" });
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(422);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).not.toContain("email: is required");
      expect(data.message).toContain("password: is required");
    }
  });

  // ❌
  it("Error: Registrar sin correo electrónico", async () => {
    try {
      await axios.post(endpoint, { password: "invalid password" });
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(422);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("email: is required");
      expect(data.message).not.toContain("password: is required");
    }
  });

  // ✅
  it("Success: Registrar correo electrónico y contraseña", async () => {
    const { status, data } = await axios.post(endpoint, userMock);
    const { message, data: userCreated } = data;

    userValid = userCreated;

    expect(status).toEqual(201);
    expect(data).not.toMatchObject({ error: true });
    expect(data).toMatchObject({ success: true });
    expect(message).toContain("user created");
    expect(userCreated).toMatchObject({ email: userMock.email });
    expect(userCreated._id.length).toBe(24);
  });

  // ❌
  it("Error: Registrar correo electrónico ya existente", async () => {
    try {
      await axios.post(endpoint, userMock);
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(422);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("email: is already taken");
    }
  });
});

describe("Pruebas de endpoint: Iniciar sesión", () => {
  const endpoint = `/auth/local/login`;
  // ❌
  it("Error: Enviar datos vacíos", async () => {
    try {
      await axios.post(endpoint, {});
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(422);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("email is required");
    }
  });

  // ❌
  it("Error: Enviar correo electrónico no válido", async () => {
    try {
      await axios.post(endpoint, { email: "esto no es un correo" });
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(422);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("invalid email address");
    }
  });

  // ❌
  it("Error: Enviar correo electrónico válido pero sin contraseña", async () => {
    try {
      await axios.post(endpoint, { email: userMock.email });
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(422);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("password is required");
    }
  });

  // ❌
  it("Error: Enviar correo electrónico válido y contraseña inválida", async () => {
    try {
      await axios.post(endpoint, {
        email: userMock.email,
        password: "invalid password",
      });
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(403);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("password is not correct");
    }
  });

  // ✅
  it("Success: Enviar datos correctos", async () => {
    const { status, data } = await axios.post(endpoint, userMock);
    const { message, data: tokenGenerated } = data;

    expect(status).toEqual(200);
    expect(data).not.toMatchObject({ error: true });
    expect(data).toMatchObject({ success: true });
    expect(message).toContain("user logged");

    token = tokenGenerated;
  });
});

describe("Pruebas de endpoint: Validar token", () => {
  const endpoint = `/auth/local/validate`;
  // ❌
  it("Error: Enviar token inválido", async () => {
    try {
      await axios.get(`${endpoint}/12345678910`);
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(401);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("invalid token");
    }
  });

  // ✅
  it("Success: Enviar token válido", async () => {
    const { status, data } = await axios.get(`${endpoint}/${token}`);
    const { message, data: payload } = data;

    expect(status).toEqual(200);
    expect(data).not.toMatchObject({ error: true });
    expect(data).toMatchObject({ success: true });
    expect(message).toContain("verified token");
    expect(payload).toMatchObject({ id: userValid._id });
  });

  // ❌
  it("Error: Enviar sin token", async () => {
    try {
      await axios.get(`${endpoint}/`);
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(404);
      expect(data).toContain("Error");
    }
  });
});

describe("Pruebas de endpoint: Recuperar contraseña", () => {
  const endpoint = "/auth/local/recover";
  // ❌
  it("Error: Enviar vacío", async () => {
    try {
      await axios.post(endpoint, {});
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(422);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("email is required");
    }
  });
  // ❌
  it("Error: Enviar correo no válido", async () => {
    try {
      await axios.post(endpoint, { email: "Esto no es un correo" });
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(422);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("invalid email address");
    }
  });
  // ❌
  it("Error: Enviar correo válido pero no registrado", async () => {
    try {
      await axios.post(endpoint, { email: "other@email.com" });
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(404);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("user not found");
    }
  });
  // ✅
  it("success: Enviar correo válido y registrado", async () => {
    const { status, data } = await axios.post(endpoint, {
      email: userMock.email,
    });

    expect(status).toEqual(200);
    expect(data).not.toMatchObject({ error: true });
    expect(data).toMatchObject({ success: true });
    expect(data.message).toContain("user found");
  });
});

describe("Pruebas de endpoint: Actualizar usuario", () => {
  const endpoint = `/api/user`;

  // ❌
  it("Error: Actualizar sin token", async () => {
    try {
      await axios.put(`${endpoint}`, {});
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(401);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("Token required");
    }
  });

  // ❌
  it("Error: Actualizar con token y sin ID de usuario", async () => {
    try {
      await axios.put(`${endpoint}`, {}, authorization(token));
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(404);
      expect(data).toContain("Error");
    }
  });

  // ❌
  it("Error: Actualizar con token, ID y datos vacios", async () => {
    try {
      await axios.put(`${endpoint}/${userValid._id}`, {}, authorization(token));
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(422);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("empty content");
    }
  });

  // ✅
  it("Success: Actualizar name (token)", async () => {
    const update = { name: "luis salcedo" };

    const { status, data } = await axios.put(
      `${endpoint}/${userValid._id}`,
      update,
      authorization(token)
    );

    expect(status).toEqual(200);
    expect(data).not.toMatchObject({ error: true });
    expect(data).toMatchObject({ success: true });
    expect(data.message).toContain("user has been updated");
    expect(data.data).toMatchObject(update);
  });

  // ❌
  it("Error: No debería permitir actualizar el email (token)", async () => {
    const update = { email: "other@email.com" };

    try {
      await axios.put(
        `${endpoint}/${userValid._id}`,
        update,
        authorization(token)
      );
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(403);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("email can not be modify");
    }
  });

  // ✅
  it("Success: Actualizar password pero no devolverlo en la respuesta (token)", async () => {
    const update = { password: "nueva contraseña" };

    const { status, data } = await axios.put(
      `${endpoint}/${userValid._id}`,
      update,
      authorization(token)
    );

    expect(status).toEqual(200);
    expect(data).not.toMatchObject({ error: true });
    expect(data).toMatchObject({ success: true });
    expect(data.message).toContain("user has been updated");
    expect(data.data.password).toBeUndefined();
  });

  // ✅
  it("Success: Actualizar image (token)", async () => {
    const update = { image: "imagen.jpg" };

    const { status, data } = await axios.put(
      `${endpoint}/${userValid._id}`,
      update,
      authorization(token)
    );

    expect(status).toEqual(200);
    expect(data).not.toMatchObject({ error: true });
    expect(data).toMatchObject({ success: true });
    expect(data.message).toContain("user has been updated");
    expect(data.data).toMatchObject(update);
  });

  // ❌
  it("Error: Actualizar dni con caracteres alfanuméricos (token)", async () => {
    const update = { dni: "12345abc" };

    try {
      await axios.put(
        `${endpoint}/${userValid._id}`,
        update,
        authorization(token)
      );
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(422);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("requires a valid DNI");
    }
  });

  // ❌
  it("Error: Actualizar dni que no tenga 8 caracteres (token)", async () => {
    const update = { dni: "1234" };

    try {
      await axios.put(
        `${endpoint}/${userValid._id}`,
        update,
        authorization(token)
      );
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(422);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("requires a valid DNI");
    }
  });

  // ✅
  it("Success: Actualizar DNI válido (token)", async () => {
    const update = { image: "12345678" };

    const { status, data } = await axios.put(
      `${endpoint}/${userValid._id}`,
      update,
      authorization(token)
    );

    expect(status).toEqual(200);
    expect(data).not.toMatchObject({ error: true });
    expect(data).toMatchObject({ success: true });
    expect(data.message).toContain("user has been updated");
    expect(data.data).toMatchObject(update);
  });

  // ❌
  it("Error: Actualizar phone con caracteres alfanuméricos (token)", async () => {
    const update = { phone: "12cda34" };

    try {
      await axios.put(
        `${endpoint}/${userValid._id}`,
        update,
        authorization(token)
      );
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(422);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("requires only numbers");
    }
  });

  // ✅
  it("Success: Actualizar phone válido (token)", async () => {
    const update = { image: "5555555" };

    const { status, data } = await axios.put(
      `${endpoint}/${userValid._id}`,
      update,
      authorization(token)
    );

    expect(status).toEqual(200);
    expect(data).not.toMatchObject({ error: true });
    expect(data).toMatchObject({ success: true });
    expect(data.message).toContain("user has been updated");
    expect(data.data).toMatchObject(update);
  });

  // actualizar phone
});
