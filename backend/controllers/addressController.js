import addressModel from "../models/addressModel.js";

// POST - create address
export const createAddressController = async (req, res) => {
  try {
    const {
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    // Check if user already has a default address, and if so, update its default status
    if (isDefault) {
      await addressModel.updateMany(
        { user: req.user._id },
        { isDefault: false }
      );
    }

    const address = await new addressModel({
      user: req.user._id,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault,
    }).save();

    res.status(201).send({
      success: true,
      message: "Address created successfully",
      address,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in creating address",
      error,
    });
  }
};

// GET - Get all addresses for user
export const getAddressesController = async (req, res) => {
  try {
    const addresses = await addressModel.find({ user: req.user._id });
    if (!addresses) {
      return res.status(404).send({
        success: false,
        message: "Address not found",
      });
    }
    res.status(200).send({
      success: true,
      addresses,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in fetching addresses",
      error,
    });
  }
};

// GET - Get default address for user
export const getDefaultAddressController = async (req, res) => {
  try {
    const address = await addressModel.findOne({
      user: req.user._id,
      isDefault: true,
    });

    if (!address) {
      return res.status(404).send({
        success: false,
        message: "Default address not found",
      });
    }
    res.status(200).send({
      success: true,
      address,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in fetching default address",
      error,
    });
  }
};

// GET- Get a single address by ID
export const getAddressByIdController = async (req, res) => {
  try {
    const address = await addressModel.findById(req.params.id);
    if (!address) {
      return res.status(404).send({
        success: false,
        message: "Address not found",
      });
    }

    res.status(200).send({
      success: true,
      address,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid ID",
        error,
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in fetching address",
      error,
    });
  }
};

// PUT - Update an existing address by ID
export const updateAddressController = async (req, res) => {
  try {
    const {
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    const address = await addressModel.findById(req.params.id);

    if (!address) {
      return res.status(404).send({
        success: false,
        message: "Address not found",
      });
    }

    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).send({
        success: false,
        message: "You do not have permission to update this address",
      });
    }

    if (isDefault) {
      await addressModel.updateMany(
        { user: req.user._id },
        { isDefault: false }
      );
    }

    address.addressLine1 = addressLine1 || address.addressLine1;
    address.addressLine2 = addressLine2 || address.addressLine2;
    address.city = city || address.city;
    address.state = state || address.state;
    address.postalCode = postalCode || address.postalCode;
    address.country = country || address.country;
    address.isDefault = isDefault || address.isDefault;

    const updatedAddress = await address.save();

    res.status(200).send({
      success: true,
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid ID",
        error,
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in updating address",
      error,
    });
  }
};

// Delete - Delete an address by ID
export const deleteAddressController = async (req, res) => {
  try {
    const addressId = req.params.id;

    // Find the address by ID
    const address = await addressModel.findById(addressId);

    if (!address) {
      return res.status(404).send({
        success: false,
        message: "Address not found",
      });
    }

    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).send({
        success: false,
        message: "You do not have permission to delete this address",
      });
    }

    // If the address is default, ensure there is another default address
    if (address.isDefault) {
      // Find another address to set as default
      const newDefaultAddress = await addressModel.findOneAndUpdate(
        { user: req.user._id, _id: { $ne: addressId } },
        { isDefault: true },
        { new: true }
      );
    }

    await address.deleteOne();

    res.status(200).send({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid ID",
        error,
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in deleting address",
      error,
    });
  }
};
