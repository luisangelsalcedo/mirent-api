import Property from "../models/property.model.js";

/**
 * ## Create Property
 * *
 * @param {ObjectId} req.auth.id - Authenticated User ID
 * @param {String} req.body.name - Name sent for property registration
 * @return {HTTPResponse} - status 200 return {property, notice} | status 400,500 return {message}
 */
export const create = async (req, res) => {
  const { id } = req.auth;
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });

  const newObject = { name, owner: id };
  const propertyExist = await Property.findOne(newObject);
  if (propertyExist)
    return res.status(400).json({ message: "Use another name" });

  const newProperty = new Property(newObject);

  try {
    const property = await newProperty.save();
    res.status(200).json({ property, notice: "New property created" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ## Get All Property
 * *
 * @param {ObjectId} req.auth.id - Authenticated User ID
 * @return {HTTPResponse} - status 200 return {arrProperty} | status 204 | status 500 return {message}
 */
export const getAll = async (req, res) => {
  const { id } = req.auth;

  try {
    const arrProperty = await Property.find({ owner: id });
    if (!arrProperty.length) return res.status(204).send();
    res.status(200).json({ arrProperty });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ## Get Property by ID
 * *
 * @param {ObjectId} req.params.id - Property ID
 * @return {HTTPResponse} - status 200 return {property} | status 404,500 return {message}
 */
export const getById = async (req, res) => {
  const { id } = req.params;

  try {
    const property = await Property.findById(id);
    if (!property)
      return res.status(404).json({ message: "Property no found" });

    res.status(200).json({ property });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ## Update Property by ID
 * *
 * @param {ObjectId} req.params.id - Property ID
 * @return {HTTPResponse} - status 200 return {property, notice} | status 400,404,500 return {message}
 */
export const updateById = async (req, res) => {
  const { id } = req.params;

  const updatedProperty = req.body;
  if (!Object.keys(updatedProperty).length)
    return res.status(400).json({ message: "Content is required" });

  try {
    const property = await Property.findByIdAndUpdate(id, updatedProperty, {
      new: true,
    });
    if (!property)
      return res.status(404).json({ message: "Property no found" });
    res.status(200).json({ property, notice: "Updated property" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ## Delete Property by ID
 * *
 * @param {ObjectId} req.params.id - Property ID
 * @return {HTTPResponse} - status 200 return {property, notice} | status 404,500 return {message}
 */
export const deleteById = async (req, res) => {
  const { id } = req.params;

  try {
    const property = await Property.findByIdAndDelete(id);
    if (!property)
      return res.status(404).json({ message: "Property no found" });
    res.status(200).json({ property, notice: "Delected property" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
