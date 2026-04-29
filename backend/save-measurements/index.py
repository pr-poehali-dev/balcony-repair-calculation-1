import json
import os
import psycopg2
import psycopg2.extras


def handler(event: dict, context) -> dict:
    """Сохраняет замеры помещения в базу данных."""

    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "86400",
            },
            "body": "",
        }

    body = json.loads(event.get("body") or "{}")

    room_width = body.get("room_width")
    room_length_left = body.get("room_length_left")
    room_length_right = body.get("room_length_right")
    height_to_sill = body.get("height_to_sill")
    height_sill_to_top = body.get("height_sill_to_top")
    client_name = body.get("client_name", "")
    client_phone = body.get("client_phone", "")
    comment = body.get("comment", "")

    if not all([room_width, room_length_left, room_length_right, height_to_sill, height_sill_to_top]):
        return {
            "statusCode": 400,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "Заполните все обязательные поля замеров"}),
        }

    conn = psycopg2.connect(os.environ["DATABASE_URL"], sslmode="disable")
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO t_p89446268_balcony_repair_calcu.measurements
            (room_width, room_length_left, room_length_right, height_to_sill, height_sill_to_top, client_name, client_phone, comment)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id, created_at
        """,
        (
            float(room_width), float(room_length_left), float(room_length_right),
            float(height_to_sill), float(height_sill_to_top),
            client_name, client_phone, comment,
        ),
    )

    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({
            "success": True,
            "id": row[0],
            "created_at": str(row[1]),
        }),
    }
