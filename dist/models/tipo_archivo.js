"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_agenda_especialista_1 = __importDefault(require("../BD/connection_agenda_especialista"));
const Tipos_archivos = connection_agenda_especialista_1.default.define("tipos_archivos", {
    nombre_tipo: {
        type: sequelize_1.DataTypes.STRING,
    },
});
exports.default = Tipos_archivos;
//# sourceMappingURL=tipo_archivo.js.map