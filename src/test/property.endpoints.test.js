import axios from "axios";
import { authorization, verifyUserOrRegister } from "./functions";

let ownerMock;
let ownerValid;
let propertyMock;
let propertyValid;

beforeAll(async () => {
  axios.defaults.baseURL = "http://localhost:5000";

  ownerMock = {
    email: `user@email.com`,
    password: "1234",
  };
  const { user, token } = await verifyUserOrRegister(ownerMock);
  const { headers } = authorization(token);
  axios.defaults.headers = headers;
  ownerValid = user;

  propertyMock = {
    name: `inmueble ${Date.now()}`,
  };
});

describe("Pruebas de endpoint: Registrar PROPERTY", () => {
  const endpoint = `/api/property`;
  // ❌
  it("Error: Enviando datos vacios", async () => {
    try {
      await axios.post(endpoint, {});
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(422);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("name: is required");
    }
  });

  // ✅
  it("Success: Enviando solo name", async () => {
    const { status, data } = await axios.post(endpoint, propertyMock);

    expect(status).toEqual(201);
    expect(data).not.toMatchObject({ error: true });
    expect(data).toMatchObject({ success: true });
    expect(data.message).toContain("property created");
    expect(data.data).toMatchObject({ owner: ownerValid._id });

    propertyValid = data.data;
  });

  // ❌
  it("Error: Enviando name que ha sido registrado antes", async () => {
    try {
      await axios.post(endpoint, propertyMock);
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(422);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("name: is already taken");
    }
  });
});

describe("Pruebas de endpoint: Obetener propiedades de un solo propietario", () => {
  const endpoint = `/api/property`;

  // ✅
  it("Success: owner autenticado", async () => {
    const { status, data } = await axios.get(endpoint);

    expect(status).toEqual(200);
    expect(data).not.toMatchObject({ error: true });
    expect(data).toMatchObject({ success: true });
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.data[0]).toMatchObject({ owner: ownerValid._id });
  });
});

describe("Pruebas de endpoint: Obtener una propiedad", () => {
  const endpoint = `/api/property`;

  // ❌
  it("Error: Enviando id inválido", async () => {
    try {
      await axios.get(`${endpoint}/1234asdf`);
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(500);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("Cast to ObjectId failed");
    }
  });

  // ✅
  it("Success: Enviando id válido", async () => {
    const { status, data } = await axios.get(
      `${endpoint}/${propertyValid._id}`
    );

    expect(status).toEqual(200);
    expect(data).not.toMatchObject({ error: true });
    expect(data).toMatchObject({ success: true });
    expect(data.data).toMatchObject({ owner: ownerValid._id });
    expect(data.data).toMatchObject(propertyMock);
  });

  // ❌
  it("Error: Enviando id válido pero no registrado", async () => {
    try {
      await axios.get(`${endpoint}/628ee461106df4095c5d95b4`);
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(404);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("property not found");
    }
  });
});

describe("Pruebas de endpoint: Actualizar propiedad", () => {
  const endpoint = `/api/property`;

  // ❌
  it("Error: Actualizar enviando datos vacios", async () => {
    try {
      await axios.put(`${endpoint}/${propertyValid._id}`, {});
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(422);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("empty content");
    }
  });

  // ❌
  it("Error: el owner no se puede actualizar", async () => {
    try {
      await axios.put(`${endpoint}/${propertyValid._id}`, {
        owner: "628ee461106df4095c5d95b4",
      });
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(403);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("owner can not be modify");
    }
  });

  // ❌
  it("Error: el state no se puede actualizar si no se tiene price", async () => {
    try {
      await axios.put(`${endpoint}/${propertyValid._id}`, {
        status: { available: true },
      });
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(422);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("price is required");
    }
  });

  // ✅
  it("Success: Actualizar enviando permitidos", async () => {
    const update = {
      name: "Casa de playa",
      address: "Av. El Sol 503, Mancora",
      details: "Casa cera al mar",
      price: 250,
    };
    const { status, data } = await axios.put(
      `${endpoint}/${propertyValid._id}`,
      update
    );
    expect(status).toEqual(200);
    expect(data).not.toMatchObject({ error: true });
    expect(data).toMatchObject({ success: true });
    expect(data.message).toContain("property updated");
    expect(data.data).toMatchObject(update);
  });
});

describe("Pruebas de endpoint: Eliminar propiedad", () => {
  const endpoint = `/api/property`;

  // ✅
  it("Success: Enviando id válido", async () => {
    const { status, data } = await axios.delete(
      `${endpoint}/${propertyValid._id}`
    );

    expect(status).toEqual(200);
    expect(data).not.toMatchObject({ error: true });
    expect(data).toMatchObject({ success: true });
    expect(data.data).toMatchObject({ owner: ownerValid._id });
    expect(data.message).toContain("delected property");
  });

  // ❌
  it("Error: Enviando id que no existe", async () => {
    try {
      await axios.delete(`${endpoint}/${propertyValid._id}`);
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(404);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("property not found");
    }
  });
});
