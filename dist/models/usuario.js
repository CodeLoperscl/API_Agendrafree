"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../BD/connection"));
//import Estados_usuarios from "./estado_usuario";
const Users = connection_1.default.define("usuarios", {
    uid: {
        type: sequelize_1.DataTypes.STRING,
    },
    username: {
        type: sequelize_1.DataTypes.STRING,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
    },
    estado_id: {
        type: sequelize_1.DataTypes.INTEGER,
    },
});
Users.prototype.toJSON = function () {
    var values = Object.assign({}, this.get());
    delete values.password;
    return values;
};
exports.default = Users;
//# sourceMappingURL=usuario.js.map