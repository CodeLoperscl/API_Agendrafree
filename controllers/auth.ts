// import Users from "../models/usuario";
import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import Users from "../models/usuario";
import { generarjwt } from "../helpers/generarJWT";

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user: any = await Users.findOne({
      where: {
        username,
      },
    });

    if (!user.username) {
      return res.status(400).json({
        msg: `El usuario con el username ${username} no existe`,
      });
    }
    if (!user.estado_id) {
      return res.status(400).json({
        msg: `El usuario se encuentra desabilitado`,
      });
    }

    const validPassword = bcryptjs.compareSync(password, user.password);
    console.log(password, "Contraseña ingresada");
    console.log(user.password, "Contraseña usuario");
    console.log("HOLAAAAAA", validPassword);

    if (!validPassword) {
      return res.status(400).json({
        msg: `La contraseña no es valida para este usuario`,
      });
    }
    const { id } = user;
    const name = user.user_name;
    const payload = { name, id };
    const token = await generarjwt(payload);
    res.json({
      msg: "login Ok",
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Algo salio mal, Hable con el Administrador",
    });
  }
};
