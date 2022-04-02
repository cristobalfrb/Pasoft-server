CREATE DATABASE trackapp;

USE DATABASE trackapp;

CREATE TABLE usuarios (
    id INT(11) NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(60) NOT NULL,
    clave VARCHAR(60) NOT NULL,
    rol VARCHAR(15) NOT NULL,
    usuarios BOOLEAN DEFAULT FALSE,
    recepcion BOOLEAN DEFAULT FALSE,
    nueces BOOLEAN DEFAULT FALSE,
    almendras BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (id),
    UNIQUE KEY (nombre)
) ENGINE = InnoDB DEFAULT CHARSET = latin1;

INSERT INTO
    usuarios(nombre, clave, rol, usuarios, recepcion, nueces, almendras)
VALUES
    ('admin', '1234', 'Administrador', true, true, true, true);

CREATE TABLE recepcion(
    nLote VARCHAR(8) NOT NULL,
    nomArticulo VARCHAR(60) NOT NULL,
    nomVariedad VARCHAR(60) NOT NULL,
    nomProductor VARCHAR(60) NOT NULL,
    pesoBruto INT(6) NOT NULL,
    tara INT(5),
    pesoNeto INT(5),
    patente VARCHAR(9),
    chofer VARCHAR(60),
    nGuia VARCHAR(60),
    fechaEntrada DATE NOT NULL,
    horaEntrada TIME NOT NULL,
    fechaSalida DATE,
    horaSalida TIME,
    observacion VARCHAR(255) DEFAULT NULL,
    estado TINYINT(1) NOT NULL,
    PRIMARY KEY(nLote)
) ENGINE = InnoDB DEFAULT CHARSET = latin1;

CREATE TABLE envases(
    idEnvase INT(11) NOT NULL AUTO_INCREMENT,
    nLote VARCHAR(8) NOT NULL,
    tipo VARCHAR(60),
    cantidad INT(5),
    PRIMARY KEY(idEnvase)
) ENGINE = InnoDB DEFAULT CHARSET = latin1;

CREATE TABLE despelonado(
    idDespelonado INT(11) NOT NULL AUTO_INCREMENT,
    nLote VARCHAR(8) NOT NULL,
    fechaEntradaDes DATE NOT NULL,
    horaEntradaDes TIME NOT NULL,
    planta VARCHAR(60) NOT NULL,
    turno VARCHAR(10) NOT NULL,
    fechaSalidaDes DATE DEFAULT NULL,
    horaSalidaDes TIME DEFAULT NULL,
    observacion VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY(idDespelonado),
    UNIQUE(nLote),
    FOREIGN KEY(nLote) REFERENCES recepcion(nLote)
) ENGINE = InnoDB DEFAULT CHARSET = latin1;

CREATE TABLE secado(
    idSecado INT(11) NOT NULL AUTO_INCREMENT,
    nLote VARCHAR(8) NOT NULL,
    nCajon INT(3) NOT NULL,
    humedad DECIMAL(3, 1) NOT NULL,
    fechaEntradaSec DATE NOT NULL,
    horaEntradaSec TIME NOT NULL,
    cerrado BOOLEAN DEFAULT FALSE NOT NULL,
    PRIMARY KEY(idSecado),
    UNIQUE (nLote, nCajon),
    FOREIGN KEY(nLote) REFERENCES recepcion(nLote)
) ENGINE = InnoDB DEFAULT CHARSET = latin1;

CREATE TABLE salida(
    idSalida INT(11) NOT NULL AUTO_INCREMENT,
    nLote VARCHAR(8) NOT NULL,
    idCajon INT(11) NOT NULL,
    humedadNSC DECIMAL(5, 2) NOT NULL, -- Campo actualizado
    humedadNCC DECIMAL(5, 2) NOT NULL, -- Campo nuevo
    almacenUnitario1 VARCHAR(30) NOT NULL,
    almacenUnitario2 VARCHAR(30) NOT NULL,
    almacenUnitario3 VARCHAR(30) NOT NULL,
    envasesUnitario1 DECIMAL(3, 1) NOT NULL,
    envasesUnitario2 DECIMAL(3, 1) NOT NULL,
    envasesUnitario3 DECIMAL(3, 1) NOT NULL,
    pesoUnitario1 INT(6) DEFAULT 0 NOT NULL,
    pesoUnitario2 INT(6) DEFAULT 0 NOT NULL,
    pesoUnitario3 INT(6) DEFAULT 0 NOT NULL,
    pesoDinamico INT(6) DEFAULT 0 NOT NULL,
    fechaDespacho DATE DEFAULT NULL,
    horaDespacho TIME DEFAULT NULL,
    fechaSalida DATE DEFAULT NULL,
    horaSalida TIME DEFAULT NULL,
    descarga INT(5) DEFAULT 0, -- Campo nuevo
    turnoSalida VARCHAR(10) DEFAULT NULL, --Campo nuevo
    observacion VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY(idSalida),
    UNIQUE (nLote, idCajon),
    FOREIGN KEY(nLote) REFERENCES recepcion(nLote),
    FOREIGN KEY(idCajon) REFERENCES secado(idSecado)
) ENGINE = InnoDB DEFAULT CHARSET = latin1;

-- CREATE TABLE cracker_proceso(
--     idProceso INT(11) NOT NULL AUTO_INCREMENT,
--     fecha DATE NOT NULL,
--     proceso VARCHAR(60) NOT NULL,
--     turno VARCHAR(60),
--     operario VARCHAR(255) NOT NULL,
--     horaInicio TIME NOT NULL,
--     horaTermino TIME DEFAULT NULL,
--     tmFallaMecanica INT(2) DEFAULT NULL,
--     tmFallaMecanicaCom VARCHAR(255) DEFAULT NULL,
--     tmCambioVariedad INT(2) DEFAULT NULL,
--     tmCambioVariedadCom VARCHAR(255) DEFAULT NULL,
--     tmFaltaFruta INT(2) DEFAULT NULL,
--     tmFaltaFrutaCom VARCHAR(255) DEFAULT NULL,
--     tmOtros INT(2) DEFAULT NULL,
--     tmOtrosCom VARCHAR(255) DEFAULT NULL,
--     colacion INT(2) DEFAULT NULL,
--     PRIMARY KEY (idProceso)
-- ) ENGINE = InnoDB DEFAULT CHARSET = latin1;

-- CREATE TABLE cracker_ingresos(
--     idIngresos INT(11) NOT NULL AUTO_INCREMENT,
--     idProceso INT(11) NOT NULL,
--     lote VARCHAR(7),
--     productor VARCHAR(60),
--     variedad VARCHAR(60),
--     estado VARCHAR(60),
--     kilos INT(6),
--     PRIMARY KEY (idIngresos),
--     FOREIGN KEY(idProceso) REFERENCES cracker_proceso(idProceso),
--     UNIQUE(lote)
-- ) ENGINE = InnoDB DEFAULT CHARSET = latin1;

-- CREATE TABLE cracker_salida(
--     idSalida INT(11) NOT NULL AUTO_INCREMENT,
--     idProceso INT(11) NOT NULL,
--     loteRepCracker VARCHAR(30),
--     kilosRepCracker INT(6),
--     loteCascaraBorrell VARCHAR(30),
--     kilosCascaraBorrell INT(6),
--     loteRepBorrell VARCHAR(30),
--     kilosRepBorrell INT(6),
--     lotePepaBruta VARCHAR(30),
--     kilosPepaBruta INT(6),
--     PRIMARY KEY (idsalida),
--     FOREIGN KEY(idProceso) REFERENCES cracker_proceso(idProceso)
-- ) ENGINE = InnoDB DEFAULT CHARSET = latin1;