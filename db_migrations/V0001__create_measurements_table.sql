CREATE TABLE t_p89446268_balcony_repair_calcu.measurements (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),

    room_width NUMERIC(6,2) NOT NULL,
    room_length_left NUMERIC(6,2) NOT NULL,
    room_length_right NUMERIC(6,2) NOT NULL,
    height_to_sill NUMERIC(6,2) NOT NULL,
    height_sill_to_top NUMERIC(6,2) NOT NULL,

    comment TEXT,
    client_name VARCHAR(255),
    client_phone VARCHAR(50)
);

COMMENT ON TABLE t_p89446268_balcony_repair_calcu.measurements IS 'Замеры помещения для калькулятора отделки';
COMMENT ON COLUMN t_p89446268_balcony_repair_calcu.measurements.room_width IS 'Ширина помещения, м';
COMMENT ON COLUMN t_p89446268_balcony_repair_calcu.measurements.room_length_left IS 'Длина с левой стороны, м';
COMMENT ON COLUMN t_p89446268_balcony_repair_calcu.measurements.room_length_right IS 'Длина с правой стороны, м';
COMMENT ON COLUMN t_p89446268_balcony_repair_calcu.measurements.height_to_sill IS 'Высота до подоконника, м';
COMMENT ON COLUMN t_p89446268_balcony_repair_calcu.measurements.height_sill_to_top IS 'Высота от подоконника до края окна, м';
