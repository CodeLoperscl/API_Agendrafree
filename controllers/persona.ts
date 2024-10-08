import Persona from "../models/persona";
import { Request, Response } from "express";
import axios from "axios";
import Nacionalidades from "../models/nacionalidad";
import Users from "../models/usuario";
import { generarCorreo } from "../helpers/generarCorreo"; //importamos la funcion de helper
import { Op } from "sequelize";
import { crearUsuario } from "./usuarios";
import { crearPaciente, obtenerDatosPaciente, getToken, obtenerPacientePorPersonaId } from "../helpers/personaHelpers"; // Importar las funciones de helpers


// Controlador para obtener todos los especialistas
export const getPersonas = async (req: Request, res: Response) => {
  try {
    // Obtener todos los pacientes de la base de datos, excluyendo 'password' de Users
    const persona = await Persona.findAll({
      include: [
        Nacionalidades,
        {
          model: Users,
          attributes: { exclude: ['password'] }, // Excluir el campo 'password'
        }
      ],
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

    // Obtener una persona por su ID, excluyendo 'password' de Users
    const persona = await Persona.findByPk(id, {
      include: [
        Nacionalidades,
        {
          model: Users,
          attributes: { exclude: ['password'] }, // Excluir el campo 'password'
        }
      ],
    });

    if (!persona) {
      return res.status(404).json({
        msg: `No existe una Persona con la id ${id}`,
      });
    }

    return res.json({ persona });
  } catch (error: any) {
    console.error("Error buscando la Persona:", error);
    return res.status(500).json({
      msg: "Error al obtener la Persona",
      error: error.message,
    });
  }
};

export const getPersona_rut = async (req: Request, res: Response) => {
  try {
    const sendToken = getToken(req); // Obtener el token del request
    const { rut } = req.params;

    // Obtener los datos de la persona en la base de datos general
    const persona: any = await Persona.findOne({
      where: { rut },
      include: [Nacionalidades, Users],
    });

    if (!persona) {
      return res.status(404).json({
        msg: `No existe una persona con la rut ${rut}`,
      });
    }

    // Obtener los datos del paciente asociado a la persona
    const pacienteData = await obtenerPacientePorPersonaId(persona.id, sendToken || '');

    return res.json({ persona, paciente: pacienteData });

  } catch (error: any) {
    console.error("Error fetching Persona:", error);
    return res.status(500).json({
      msg: "Error al obtener el paciente",
      error: error.message,
    });
  }
};

export const postPersona = async (req: Request, res: Response) => {
  const { nombre, apellido, rut, email, fono, nacionalidad_id, prevision_id, estado_id } = req.body;

  try {
    // Verificar si ya existe una persona con el mismo RUT o correo
    const existePersona = await Persona.findOne({ where: { rut } });
    if (existePersona) {
      return res.status(400).json({ msg: "Ya existe una persona con este rut " + rut });
    }

    const existePersona2 = await Persona.findOne({ where: { email } });
    if (existePersona2) {
      return res.status(400).json({ msg: "Ya existe una persona con este email " + email });
    }

    // Crear un usuario asociado a la persona
    const { id: usuario_id }: any = await crearUsuario(rut);
    if (!usuario_id) {
      return res.status(400).json({ msg: "Error al crear el usuario con este rut " + rut });
    }

    // Crear persona en la base de datos "general"
    const persona: any = await Persona.create({ nombre, apellido, rut, email, fono, nacionalidad_id, usuario_id });

    // Obtener el token del header
    const token = getToken(req);

    // Crear el paciente en la base de datos del especialista
    try {
      const url = `${process.env.API_URL}paciente`; // Asegurarse de que la URL esté bien formada
      const paciente = await crearPaciente(persona.id, prevision_id, estado_id, token || '', url);
      console.log("Paciente creado en la base de datos especialista:", paciente);

      // Configurar el mensaje de bienvenida
      const emailContent = `
      <h1>Bienvenido a nuestra clínica, ${nombre} ${apellido}!</h1>
      <p>Gracias por registrarte. Aquí tienes un resumen de tus datos:</p>
      <ul>
        <li><strong>Nombre:</strong> ${nombre}</li>
        <li><strong>Apellido:</strong> ${apellido}</li>
        <li><strong>RUT:</strong> ${rut}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Teléfono:</strong> ${fono}</li>
      </ul>
      `;
      if(email){//Verifica si el email enviado por body es distinto a null
        // Usar la función generarCorreo para enviar el email
        await generarCorreo(email, 'Bienvenido a nuestra clínica', emailContent);
        console.log(paciente);
      }
      // Responder con los datos del persona creada y el paciente asociado
      res.json({ persona, paciente });
    } catch (error) {
      console.error("Error creando paciente en el proyecto especialista:", error);
      return res.status(500).json({ 
        msg: "Error al crear el paciente en la base de datos especialista",
        error: (error as Error).message, // Proporcionar más detalles del error
      });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Hable con el administrador" });
  }
};

export const putPersona = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { body } = req;

  try {
    const paciente = await Persona.findByPk(id);
    if (!paciente) {
      return res.status(404).json({
        msg: "No existe una paciente con el id " + id,
      });
    }

    await paciente.update(body);

    res.json(paciente);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Hable con el administrador",
    });
  }
};

export const deletePersona = async (req: Request, res: Response) => {
  const { id } = req.params;
  const paciente = await Persona.findByPk(id);
  if (!paciente) {
    return res.status(404).json({
      msg: "No existe una paciente con el id " + id,
    });
  }
  await paciente.update({ estado_id: 2 });
  // await estado_usuario.destroy();
  res.json(paciente);
};




