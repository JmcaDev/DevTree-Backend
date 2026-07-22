import { Request, Response } from "express";
import { validationResult } from "express-validator";
import slug, { reset } from "slug";
import colors from "colors";
import formidable from "formidable";
import { v4 as uuid } from "uuid";

import User, { IUser } from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

import { checkPassword, hashPassword } from "../utils/auth.js";
import { generateJWT } from "../utils/jwt.js";

export const createAccount = async (req: Request, res: Response) => {
  //Manejar Errores
  const { email, password, handle } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    const error = new Error("Un usuario con ese correo ya esta registrado");
    return res.status(409).json({ error: error.message });
  }

  const currentHandle = slug(handle, "-");
  const handleExists = await User.findOne({ handle: currentHandle });
  if (handleExists) {
    const error = new Error("Nombre de usuario no disponible");
    return res.status(409).json({ error: error.message });
  }

  const user = new User(req.body);
  user.password = await hashPassword(password);
  user.handle = currentHandle;

  try {
    await user.save();
    res.status(201).json({ mensaje: "Usuario creado correctamente" });
  } catch (error) {
    console.log(colors.red(`Error: ${error}`));
  }
};

export const loginAccount = async (req: Request, res: Response) => {
  //Manejar Errores
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  //Revisar si el usuario esta registrado
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("El usuario no existe");
    return res.status(404).json({ error: error.message });
  }

  //Comprobar la contraseña
  const isPasswordCorrect = await checkPassword(password, user.password);
  if (!isPasswordCorrect) {
    const error = new Error("Contraseña incorrecta");
    return res.status(401).json({ error: error.message });
  }

  const token = generateJWT({ id: user._id });

  res.status(200).json({ mensaje: token });
};

export const getUser = async (req: Request, res: Response) => {
  res.status(200).json(req.user);
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { handle, description, links } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const handleNew = slug(handle, "-");

    if (handleNew !== req.user.handle) {
      const handleExists = await User.findOne({ handle: handleNew });
      if (handleExists) {
        const error = new Error("Nombre de usuario no disponible");
        return res.status(409).json({ error: error.message });
      }
      req.user.handle = handleNew;
    }

    if (description !== undefined) {
      req.user.description = description;
    }

    if (links !== undefined) {
      req.user.links = links;
    }

    await req.user.save();

    return res.status(200).json({ message: "Perfil actualizado" });
  } catch (e) {
    const error = new Error("Hubo un error");
    return res.status(500).json({ error: error.message });
  }
};

export const uploadImage = async (req: Request, res: Response) => {
  const form = formidable({ multiples: false });

  try {
    form.parse(req, (error, fields, files) => {
      if (!files.file) {
        const error = new Error("Hubo un error al subir la imagen");
        return res.status(500).json({ error: error.message });
      }

      cloudinary.uploader.upload(
        files.file[0].filepath,
        { public_id: uuid() },
        async function (error, result) {
          if (error) {
            const error = new Error("Hubo un error al subir la imagen");
            return res.status(500).json({ error: error.message });
          }

          if (result) {
            if (!req.user) {
              return res.status(401).json({ error: "No autorizado" });
            }

            req.user.image = result.secure_url;
            await req.user.save();
            res.json({ image: result.secure_url });
          }
        },
      );
    });
  } catch (e) {
    const error = new Error("Hubo un error");
    return res.status(500).json({ error: error.message });
  }
};

export const getUserByHandle = async (req: Request, res: Response) => {
  try {
    const { handle } = req.params;
    const user = await User.findOne({ handle }).select(
      "-_id -password -__v -email",
    );
    if (!user) {
      const error = new Error("El usuario no existe");
      return res.status(404).json({ error: error.message });
    }
    res.json(user);
  } catch (e) {
    const error = new Error("Hubo un error");
    return res.status(500).json({ error: error.message });
  }
};

export const searchByHandle = async (req: Request, res: Response) => {
  try {
    const { handle } = req.body;
    const userExists = await User.findOne({ handle });
    if (userExists) {
      const error = new Error(`${handle} ya esta registrado`);
      return res.status(409).json({ error: error.message });
    }
    res.send(`${handle} esta disponible`);
  } catch (e) {
    const error = new Error("Hubo un error");
    return res.status(500).json({ error: error.message });
  }
};
