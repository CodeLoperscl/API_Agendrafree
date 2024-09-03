import Persona from "../models/persona";
import { Request, Response } from "express";
import axios from "axios";
import Nacionalidades from "../models/nacionalidad";
import Users from "../models/usuario";


// import Estados from "../models/estado";

// Definición de la interfaz Persona
interface Paciente {
  id: number;
  paciente_id: number;
  prevision_id: number;
  estado_id: number;
}

// Función para obtener los datos de una paciente
async function data_paciente(url: string): Promise<Paciente> {
  try {
    const { data: paciente } = await axios.get(url);
    return paciente;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    throw error;
  }
}

// Controlador para obtener todos los especialistas
export const getPersonas = async (req: Request, res: Response) => {
  try {
    // Obtener todos los pacientes de la base de datos
    const persona = await Persona.findAll({
      include: [Nacionalidades, Users],
    });

    res.json({ persona });
  } catch (error) {
    console.error("Error buscando especialistas:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPersona = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const persona = await Persona.findByPk(id, {
      include: [Nacionalidades, Users],
    });

    if (!persona) {
      return res.status(404).json({
        msg: `No existe un Persona con la id ${id}`,
      });
    }

    return res.json({ persona });

  } catch (error: any) {
    console.error("Error fetching Persona:", error);
    return res.status(500).json({
      msg: "Error al obtener la Persona",
      error: error.message,
    });
  }
};

export const getPersona_rut = async (req: Request, res: Response) => {
  try {
  const { rut }: any = req.params;
  console.log(rut);
  const persona: any = await Persona.findOne({
    where: { rut },
    include: [Nacionalidades, Users]
  });

  if (!persona) {
    return res.status(404).json({
      msg: `No existe una persona con la rut ${rut}`,
    });
  }
  const paciente = await data_paciente(
    `${process.env.API_URL}paciente/persona/${persona.id}`  // AGREGAR RUTA Y METODO
  );

  return res.json({ persona, paciente });

}catch (error: any) {
    console.error("Error fetching Persona:", error);
    return res.status(500).json({
      msg: "Error al obtener la Persona",
      error: error.message,
    });
  }
};

export const postPersona = async (req: Request, res: Response) => {
  const { body } = req;
  const { nombre, apellido, rut, email, fono, nacionalidad_id, usuario_id } = body;
  try {
    const existePersona = await Persona.findOne({
      where: {
        rut,
      },
    });

    if (existePersona) {
      return res.status(400).json({
        msg: "Ya existe una paciente con este rut " + rut,
      });
    }

    const paciente = await Persona.create({ nombre, apellido, rut, email, fono, nacionalidad_id, usuario_id });

    // res.json(psswd);
    res.json(paciente);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Hable con el administrador",
    });
  }
};

// export const putPersona = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const { body } = req;

//   try {
//     const paciente = await Persona.findByPk(id);
//     if (!paciente) {
//       return res.status(404).json({
//         msg: "No existe una paciente con el id " + id,
//       });
//     }

//     await paciente.update(body);

//     res.json(paciente);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       msg: "Hable con el administrador",
//     });
//   }
// };

// export const deletePersona = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const paciente = await Persona.findByPk(id);
//   if (!paciente) {
//   return res.status(404).json({
//       msg: "No existe una paciente con el id " + id,
//   });
//   }
//   await paciente.update({ estado_id: 2 });
// // await estado_usuario.destroy();
//   res.json(paciente);
// };
