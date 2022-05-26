import axios from "axios";
import { authorization, verifyUserOrRegister } from "./functions";
import { propertyDefaultStatus } from "../schemas/property.schema.js";

let ownerMock;
let ownerValid;
let propertyMock;
let propertyValid;
let agreementMock;

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
    price: 500,
  };
  const { data } = await axios.post(`/api/property`, propertyMock);
  propertyValid = data.data;
});

describe("Pruebas de endpoint: Registrar AGREEMENT", () => {
  const endpoint = "/api/agreement";
  // ❌
  it("Error: Enviando datos vacios", async () => {
    try {
      await axios.post(endpoint, {});
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(422);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("property: is required");
    }
  });

  // ❌
  it("Error: Enviando property sin activar", async () => {
    try {
      await axios.post(endpoint, { property: propertyValid._id });
    } catch ({ response }) {
      const { status, data } = response;

      expect(status).toEqual(422);
      expect(data).toMatchObject({ error: true });
      expect(data).not.toMatchObject({ success: true });
      expect(data.message).toContain("property: add an available property");
    }
  });

  // ✅
  it("Success: Enviando property activada", async () => {
    const { data: propertyUpdated } = await axios.put(
      `/api/property/${propertyValid._id}`,
      {
        status: { available: true },
      }
    );
    propertyValid = propertyUpdated.data;
    const { status, data } = await axios.post(endpoint, {
      property: propertyValid._id,
    });

    expect(status).toEqual(201);
    expect(data).not.toMatchObject({ error: true });
    expect(data).toMatchObject({ success: true });
    expect(data.message).toContain("agreement created");
  });

  // ✅
  it("Success: La propiedad registrada cambia de estado a en renta", async () => {
    const { status, data: propertyUpdated } = await axios.get(
      `/api/property/${propertyValid._id}`
    );

    expect(status).toEqual(200);
    expect(propertyUpdated).not.toMatchObject({ error: true });
    expect(propertyUpdated).toMatchObject({ success: true });
    expect(propertyUpdated.data).toMatchObject({
      status: { ...propertyDefaultStatus, rented: true },
    });

    propertyValid = propertyUpdated.data;
  });
});
