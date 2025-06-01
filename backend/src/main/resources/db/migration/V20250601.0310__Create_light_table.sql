CREATE TABLE light_entity
(
    uuid                        UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    address                     VARCHAR(512)     NOT NULL,
    longitude                   DECIMAL          NOT NULL,
    latitude                    DECIMAL          NOT NULL,
    note                        VARCHAR(1024),
    brightness_config           JSONB            NOT NULL,
    brightness                  DOUBLE PRECISION NOT NULL,
    heartbeat_at                TIMESTAMP WITHOUT TIME ZONE,
    motion_at                   TIMESTAMP WITHOUT TIME ZONE,
    disable_at                  TIMESTAMP WITHOUT TIME ZONE,
    disable_after_seconds       INTEGER          NOT NULL,
    proximity_activation_radius DOUBLE PRECISION NOT NULL
);
