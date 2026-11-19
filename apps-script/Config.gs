/**
 * Generado por scripts/build.js — no editar a mano.
 * Fuente: data/seed.json
 */
const CONFIG = {
  "meta": {
    "institution": "Colegio Interamericano",
    "year": 2026,
    "period": "2026",
    "section": "Bachillerato",
    "intro": "Estimado(a) estudiante, tu opinión acerca de la forma como el profesor organiza, desarrolla y evalúa el curso es muy importante para nuestra institución educativa. A continuación se presentan una serie de aspectos relevantes para que valores el desempeño del docente con la mayor objetividad posible, marcando la respuesta que mejor represente tu opinión.",
    "scale": {
      "type": "yesno",
      "labels": [
        "No",
        "Sí"
      ],
      "values": [
        0,
        1
      ]
    }
  },
  "settings": {
    "requireIdentification": true,
    "allowComment": true,
    "commentRequired": false,
    "minResponsesForDisplay": 3,
    "showDashboardLink": false,
    "thresholds": {
      "excellent": 80,
      "good": 60,
      "acceptable": 40
    }
  },
  "grades": [
    {
      "id": "6",
      "name": "6°",
      "courses": [
        "601",
        "602"
      ],
      "students": 47,
      "courseStudents": [
        {
          "course": "601",
          "students": 23
        },
        {
          "course": "602",
          "students": 24
        }
      ]
    },
    {
      "id": "7",
      "name": "7°",
      "courses": [
        "701",
        "702"
      ],
      "students": 55,
      "courseStudents": [
        {
          "course": "701",
          "students": 27
        },
        {
          "course": "702",
          "students": 28
        }
      ]
    },
    {
      "id": "8",
      "name": "8°",
      "courses": [
        "801",
        "802"
      ],
      "students": 47,
      "courseStudents": [
        {
          "course": "801",
          "students": 22
        },
        {
          "course": "802",
          "students": 25
        }
      ]
    },
    {
      "id": "9",
      "name": "9°",
      "courses": [
        "901",
        "902"
      ],
      "students": 44,
      "courseStudents": [
        {
          "course": "901",
          "students": 21
        },
        {
          "course": "902",
          "students": 23
        }
      ]
    },
    {
      "id": "10",
      "name": "10°",
      "courses": [
        "10-1",
        "10-2"
      ],
      "students": 50,
      "courseStudents": [
        {
          "course": "10-1",
          "students": 24
        },
        {
          "course": "10-2",
          "students": 26
        }
      ]
    },
    {
      "id": "11",
      "name": "11°",
      "courses": [
        "11-1",
        "11-2"
      ],
      "students": 46,
      "courseStudents": [
        {
          "course": "11-1",
          "students": 20
        },
        {
          "course": "11-2",
          "students": 26
        }
      ]
    }
  ],
  "teachers": [
    {
      "id": "doc_98dd5e1a93",
      "name": "Alfonso Héctor Oswaldo",
      "homeroom": null,
      "photo": "assets/photos/doc_98dd5e1a93.webp",
      "assignments": [
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-1",
          "area": "Educación Física, Recreación y Deportes",
          "subject": "Educación Física"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-2",
          "area": "Educación Física, Recreación y Deportes",
          "subject": "Educación Física"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "802",
          "area": "Educación Física, Recreación y Deportes",
          "subject": "Educación Física"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-2",
          "area": "Educación Física, Recreación y Deportes",
          "subject": "Educación Física"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "901",
          "area": "Educación Física, Recreación y Deportes",
          "subject": "Educación Física"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "902",
          "area": "Educación Física, Recreación y Deportes",
          "subject": "Educación Física"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "601",
          "area": "Educación Física, Recreación y Deportes",
          "subject": "Educación Física"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "602",
          "area": "Educación Física, Recreación y Deportes",
          "subject": "Educación Física"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "801",
          "area": "Educación Física, Recreación y Deportes",
          "subject": "Educación Física"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "702",
          "area": "Educación Física, Recreación y Deportes",
          "subject": "Educación Física"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "701",
          "area": "Educación Física, Recreación y Deportes",
          "subject": "Educación Física"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-1",
          "area": "Educación Física, Recreación y Deportes",
          "subject": "Educación Física"
        }
      ]
    },
    {
      "id": "doc_fb05898402",
      "name": "Arias Montenegro Sirley",
      "homeroom": "11-1",
      "photo": "assets/photos/doc_fb05898402.webp",
      "assignments": [
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-1",
          "area": "Convivencia",
          "subject": "Convivencia"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-2",
          "area": "Filosofía",
          "subject": "Filosofía"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-2",
          "area": "Filosofía",
          "subject": "Filosofía"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-1",
          "area": "Filosofía",
          "subject": "Filosofía"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-1",
          "area": "Filosofía",
          "subject": "Filosofía"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-2",
          "area": "Humanidades, Lengua Castellana e Idiomas Extranjeros",
          "subject": "Lengua Castellana"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-2",
          "area": "Humanidades, Lengua Castellana e Idiomas Extranjeros",
          "subject": "Lengua Castellana"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-1",
          "area": "Humanidades, Lengua Castellana e Idiomas Extranjeros",
          "subject": "Lengua Castellana"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "901",
          "area": "Humanidades, Lengua Castellana e Idiomas Extranjeros",
          "subject": "Lengua Castellana"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "902",
          "area": "Humanidades, Lengua Castellana e Idiomas Extranjeros",
          "subject": "Lengua Castellana"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-1",
          "area": "Humanidades, Lengua Castellana e Idiomas Extranjeros",
          "subject": "Lengua Castellana"
        }
      ]
    },
    {
      "id": "doc_15d5d26fcb",
      "name": "Camargo Moreno Harley Zamir",
      "homeroom": "10-1",
      "photo": "assets/photos/doc_15d5d26fcb.webp",
      "assignments": [
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "902",
          "area": "Ciencias Naturales y Educación Ambiental",
          "subject": "Ciencias Naturales"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "901",
          "area": "Ciencias Naturales y Educación Ambiental",
          "subject": "Ciencias Naturales"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-1",
          "area": "Convivencia",
          "subject": "Convivencia"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-2",
          "area": "Ciencias Naturales y Educación Ambiental",
          "subject": "Química"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-2",
          "area": "Ciencias Naturales y Educación Ambiental",
          "subject": "Química"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-1",
          "area": "Ciencias Naturales y Educación Ambiental",
          "subject": "Química"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-1",
          "area": "Ciencias Naturales y Educación Ambiental",
          "subject": "Química"
        }
      ]
    },
    {
      "id": "doc_ed1e6e8a57",
      "name": "Collazos Bolivar Ivan Andrés",
      "homeroom": null,
      "photo": "assets/photos/doc_ed1e6e8a57.webp",
      "assignments": [
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-1",
          "area": "Humanidades, Lengua Castellana e Idiomas Extranjeros",
          "subject": "Inglés"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "902",
          "area": "Humanidades, Lengua Castellana e Idiomas Extranjeros",
          "subject": "Inglés"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-2",
          "area": "Humanidades, Lengua Castellana e Idiomas Extranjeros",
          "subject": "Inglés"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "901",
          "area": "Humanidades, Lengua Castellana e Idiomas Extranjeros",
          "subject": "Inglés"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-2",
          "area": "Humanidades, Lengua Castellana e Idiomas Extranjeros",
          "subject": "Inglés"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-1",
          "area": "Humanidades, Lengua Castellana e Idiomas Extranjeros",
          "subject": "Inglés"
        }
      ]
    },
    {
      "id": "doc_7d48bdb8a0",
      "name": "Cortes Perez Monica Andrea",
      "homeroom": "801",
      "photo": "assets/photos/doc_7d48bdb8a0.webp",
      "assignments": [
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "802",
          "area": "Ciencias Naturales y Educación Ambiental",
          "subject": "Ciencias Naturales"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "701",
          "area": "Ciencias Naturales y Educación Ambiental",
          "subject": "Ciencias Naturales"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "801",
          "area": "Ciencias Naturales y Educación Ambiental",
          "subject": "Ciencias Naturales"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "702",
          "area": "Ciencias Naturales y Educación Ambiental",
          "subject": "Ciencias Naturales"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "602",
          "area": "Ciencias Naturales y Educación Ambiental",
          "subject": "Ciencias Naturales"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "601",
          "area": "Ciencias Naturales y Educación Ambiental",
          "subject": "Ciencias Naturales"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "801",
          "area": "Convivencia",
          "subject": "Convivencia"
        }
      ]
    },
    {
      "id": "doc_b8ba93700b",
      "name": "Cruz González Jessica Alexandra",
      "homeroom": "802",
      "photo": "assets/photos/doc_b8ba93700b.webp",
      "assignments": [
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "802",
          "area": "Convivencia",
          "subject": "Convivencia"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "801",
          "area": "Humanidades, Lengua Castellana e Idiomas Extranjeros",
          "subject": "Inglés"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "602",
          "area": "Humanidades, Lengua Castellana e Idiomas Extranjeros",
          "subject": "Inglés"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "802",
          "area": "Humanidades, Lengua Castellana e Idiomas Extranjeros",
          "subject": "Inglés"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "702",
          "area": "Humanidades, Lengua Castellana e Idiomas Extranjeros",
          "subject": "Inglés"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "601",
          "area": "Humanidades, Lengua Castellana e Idiomas Extranjeros",
          "subject": "Inglés"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "701",
          "area": "Humanidades, Lengua Castellana e Idiomas Extranjeros",
          "subject": "Inglés"
        }
      ]
    },
    {
      "id": "doc_c8db4cda0a",
      "name": "Cuervo Forero Claudia Karina",
      "homeroom": "11-2",
      "photo": "assets/photos/doc_c8db4cda0a.webp",
      "assignments": [
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-2",
          "area": "Convivencia",
          "subject": "Convivencia"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-1",
          "area": "Educación Religiosa",
          "subject": "Educación Religiosa"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "901",
          "area": "Educación Religiosa",
          "subject": "Educación Religiosa"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "902",
          "area": "Educación Religiosa",
          "subject": "Educación Religiosa"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-1",
          "area": "Educación Religiosa",
          "subject": "Educación Religiosa"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-2",
          "area": "Educación Religiosa",
          "subject": "Educación Religiosa"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-2",
          "area": "Educación Religiosa",
          "subject": "Educación Religiosa"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-1",
          "area": "Educación Ética y en Valores Humanos",
          "subject": "Ética"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-2",
          "area": "Educación Ética y en Valores Humanos",
          "subject": "Ética"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-2",
          "area": "Educación Ética y en Valores Humanos",
          "subject": "Ética"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-1",
          "area": "Educación Ética y en Valores Humanos",
          "subject": "Ética"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "902",
          "area": "Educación Ética y en Valores Humanos",
          "subject": "Ética"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "901",
          "area": "Educación Ética y en Valores Humanos",
          "subject": "Ética"
        }
      ]
    },
    {
      "id": "doc_fe73d8ae21",
      "name": "González Montañez Mauricio",
      "homeroom": "602",
      "photo": "assets/photos/doc_fe73d8ae21.webp",
      "assignments": [
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "602",
          "area": "Convivencia",
          "subject": "Convivencia"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "701",
          "area": "Matemáticas",
          "subject": "Matemáticas"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "802",
          "area": "Matemáticas",
          "subject": "Matemáticas"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "801",
          "area": "Matemáticas",
          "subject": "Matemáticas"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "702",
          "area": "Matemáticas",
          "subject": "Matemáticas"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "602",
          "area": "Matemáticas",
          "subject": "Matemáticas"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "601",
          "area": "Matemáticas",
          "subject": "Matemáticas"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "601",
          "area": "Matemáticas",
          "subject": "Pensamiento Lógico"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "602",
          "area": "Matemáticas",
          "subject": "Pensamiento Lógico"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "702",
          "area": "Matemáticas",
          "subject": "Pensamiento Lógico"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "801",
          "area": "Matemáticas",
          "subject": "Pensamiento Lógico"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "802",
          "area": "Matemáticas",
          "subject": "Pensamiento Lógico"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "701",
          "area": "Matemáticas",
          "subject": "Pensamiento Lógico"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "801",
          "area": "Emprendimiento",
          "subject": "Proyecto Emprendedor"
        }
      ]
    },
    {
      "id": "doc_25c278c7a4",
      "name": "Lopez Prieto Shirley Johanna",
      "homeroom": "901",
      "photo": "assets/photos/doc_25c278c7a4.webp",
      "assignments": [
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-2",
          "area": "Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia",
          "subject": "Cátedra de la Paz"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-1",
          "area": "Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia",
          "subject": "Cátedra de la Paz"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "902",
          "area": "Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia",
          "subject": "Cátedra de la Paz"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-2",
          "area": "Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia",
          "subject": "Cátedra de la Paz"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-1",
          "area": "Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia",
          "subject": "Cátedra de la Paz"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "901",
          "area": "Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia",
          "subject": "Cátedra de la Paz"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "902",
          "area": "Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia",
          "subject": "Ciencias Sociales y Competencias Ciudadanas"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "901",
          "area": "Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia",
          "subject": "Ciencias Sociales y Competencias Ciudadanas"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "901",
          "area": "Convivencia",
          "subject": "Convivencia"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-1",
          "area": "Ciencias Económicas",
          "subject": "Economía"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-2",
          "area": "Ciencias Económicas",
          "subject": "Economía"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-2",
          "area": "Ciencias Económicas",
          "subject": "Economía"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-1",
          "area": "Ciencias Económicas",
          "subject": "Economía"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-1",
          "area": "Ciencias Políticas",
          "subject": "Política"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-1",
          "area": "Ciencias Políticas",
          "subject": "Política"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-2",
          "area": "Ciencias Políticas",
          "subject": "Política"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-2",
          "area": "Ciencias Políticas",
          "subject": "Política"
        }
      ]
    },
    {
      "id": "doc_8ef3ce326a",
      "name": "Rincón Sanabria Juan Camilo",
      "homeroom": "902",
      "photo": "assets/photos/doc_8ef3ce326a.webp",
      "assignments": [
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "702",
          "area": "Educación Artística",
          "subject": "Artes"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "801",
          "area": "Educación Artística",
          "subject": "Artes"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "602",
          "area": "Educación Artística",
          "subject": "Artes"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "601",
          "area": "Educación Artística",
          "subject": "Artes"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "701",
          "area": "Educación Artística",
          "subject": "Artes"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "902",
          "area": "Educación Artística",
          "subject": "Artes"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "802",
          "area": "Educación Artística",
          "subject": "Artes"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "901",
          "area": "Educación Artística",
          "subject": "Artes"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-1",
          "area": "Educación Artística",
          "subject": "Artes"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-1",
          "area": "Educación Artística",
          "subject": "Artes"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-2",
          "area": "Educación Artística",
          "subject": "Artes"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-2",
          "area": "Educación Artística",
          "subject": "Artes"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "902",
          "area": "Convivencia",
          "subject": "Convivencia"
        }
      ]
    },
    {
      "id": "doc_3d24a5f1cd",
      "name": "Rodriguez Espitia Eimy Lorena",
      "homeroom": "601",
      "photo": "assets/photos/doc_3d24a5f1cd.webp",
      "assignments": [
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "601",
          "area": "Convivencia",
          "subject": "Convivencia"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "601",
          "area": "Educación Religiosa",
          "subject": "Educación Religiosa"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "602",
          "area": "Educación Religiosa",
          "subject": "Educación Religiosa"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "701",
          "area": "Educación Religiosa",
          "subject": "Educación Religiosa"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "802",
          "area": "Educación Religiosa",
          "subject": "Educación Religiosa"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "801",
          "area": "Educación Religiosa",
          "subject": "Educación Religiosa"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "702",
          "area": "Educación Religiosa",
          "subject": "Educación Religiosa"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "601",
          "area": "Educación Ética y en Valores Humanos",
          "subject": "Ética"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "602",
          "area": "Educación Ética y en Valores Humanos",
          "subject": "Ética"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "702",
          "area": "Educación Ética y en Valores Humanos",
          "subject": "Ética"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "801",
          "area": "Educación Ética y en Valores Humanos",
          "subject": "Ética"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "802",
          "area": "Educación Ética y en Valores Humanos",
          "subject": "Ética"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "701",
          "area": "Educación Ética y en Valores Humanos",
          "subject": "Ética"
        }
      ]
    },
    {
      "id": "doc_ee6f5185b3",
      "name": "Ruiz Cárdenas Luis Miguel",
      "homeroom": "701",
      "photo": "assets/photos/doc_ee6f5185b3.webp",
      "assignments": [
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "701",
          "area": "Convivencia",
          "subject": "Convivencia"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "601",
          "area": "Humanidades, Lengua Castellana e Idiomas Extranjeros",
          "subject": "Lengua Castellana"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "602",
          "area": "Humanidades, Lengua Castellana e Idiomas Extranjeros",
          "subject": "Lengua Castellana"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "702",
          "area": "Humanidades, Lengua Castellana e Idiomas Extranjeros",
          "subject": "Lengua Castellana"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "801",
          "area": "Humanidades, Lengua Castellana e Idiomas Extranjeros",
          "subject": "Lengua Castellana"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "802",
          "area": "Humanidades, Lengua Castellana e Idiomas Extranjeros",
          "subject": "Lengua Castellana"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "701",
          "area": "Humanidades, Lengua Castellana e Idiomas Extranjeros",
          "subject": "Lengua Castellana"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "701",
          "area": "Emprendimiento",
          "subject": "Proyecto Emprendedor"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "802",
          "area": "Emprendimiento",
          "subject": "Proyecto Emprendedor"
        }
      ]
    },
    {
      "id": "doc_659aee031a",
      "name": "Solano Pulido Francisco Alberto",
      "homeroom": null,
      "photo": "assets/photos/doc_659aee031a.webp",
      "assignments": [
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-2",
          "area": "Ciencias Naturales y Educación Ambiental",
          "subject": "Física"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-1",
          "area": "Ciencias Naturales y Educación Ambiental",
          "subject": "Física"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-2",
          "area": "Ciencias Naturales y Educación Ambiental",
          "subject": "Física"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-1",
          "area": "Ciencias Naturales y Educación Ambiental",
          "subject": "Física"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "702",
          "area": "Emprendimiento",
          "subject": "Proyecto Emprendedor"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "601",
          "area": "Emprendimiento",
          "subject": "Proyecto Emprendedor"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "602",
          "area": "Emprendimiento",
          "subject": "Proyecto Emprendedor"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "701",
          "area": "Tecnología e Informática",
          "subject": "Tecnología"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "801",
          "area": "Tecnología e Informática",
          "subject": "Tecnología"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "702",
          "area": "Tecnología e Informática",
          "subject": "Tecnología"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-1",
          "area": "Tecnología e Informática",
          "subject": "Tecnología"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "802",
          "area": "Tecnología e Informática",
          "subject": "Tecnología"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-2",
          "area": "Tecnología e Informática",
          "subject": "Tecnología"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-1",
          "area": "Tecnología e Informática",
          "subject": "Tecnología"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "602",
          "area": "Tecnología e Informática",
          "subject": "Tecnología"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-2",
          "area": "Tecnología e Informática",
          "subject": "Tecnología"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "601",
          "area": "Tecnología e Informática",
          "subject": "Tecnología"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "902",
          "area": "Tecnología e Informática",
          "subject": "Tecnología"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "901",
          "area": "Tecnología e Informática",
          "subject": "Tecnología"
        }
      ]
    },
    {
      "id": "doc_e10020e753",
      "name": "Sora Salas Alba Dilia",
      "homeroom": "10-2",
      "photo": "assets/photos/doc_e10020e753.webp",
      "assignments": [
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-2",
          "area": "Convivencia",
          "subject": "Convivencia"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-1",
          "area": "Matemáticas",
          "subject": "Matemáticas"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-2",
          "area": "Matemáticas",
          "subject": "Matemáticas"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-1",
          "area": "Matemáticas",
          "subject": "Matemáticas"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "902",
          "area": "Matemáticas",
          "subject": "Matemáticas"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "901",
          "area": "Matemáticas",
          "subject": "Matemáticas"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-2",
          "area": "Matemáticas",
          "subject": "Matemáticas"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "901",
          "area": "Matemáticas",
          "subject": "Pensamiento Lógico"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-1",
          "area": "Matemáticas",
          "subject": "Pensamiento Lógico"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-2",
          "area": "Matemáticas",
          "subject": "Pensamiento Lógico"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-2",
          "area": "Matemáticas",
          "subject": "Pensamiento Lógico"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "902",
          "area": "Matemáticas",
          "subject": "Pensamiento Lógico"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-1",
          "area": "Matemáticas",
          "subject": "Pensamiento Lógico"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "901",
          "area": "Emprendimiento",
          "subject": "Proyecto Emprendedor"
        }
      ]
    },
    {
      "id": "doc_5f06156804",
      "name": "Valenzuela Vargas Juan Carlos",
      "homeroom": null,
      "photo": "assets/photos/doc_5f06156804.webp",
      "assignments": [
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "801",
          "area": "Tecnología e Informática",
          "subject": "Informática"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "701",
          "area": "Tecnología e Informática",
          "subject": "Informática"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-1",
          "area": "Tecnología e Informática",
          "subject": "Informática"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "602",
          "area": "Tecnología e Informática",
          "subject": "Informática"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "601",
          "area": "Tecnología e Informática",
          "subject": "Informática"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "902",
          "area": "Tecnología e Informática",
          "subject": "Informática"
        },
        {
          "gradeId": "9",
          "grade": "9°",
          "course": "901",
          "area": "Tecnología e Informática",
          "subject": "Informática"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-2",
          "area": "Tecnología e Informática",
          "subject": "Informática"
        },
        {
          "gradeId": "11",
          "grade": "11°",
          "course": "11-1",
          "area": "Tecnología e Informática",
          "subject": "Informática"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "702",
          "area": "Tecnología e Informática",
          "subject": "Informática"
        },
        {
          "gradeId": "10",
          "grade": "10°",
          "course": "10-2",
          "area": "Tecnología e Informática",
          "subject": "Informática"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "802",
          "area": "Tecnología e Informática",
          "subject": "Informática"
        }
      ]
    },
    {
      "id": "doc_74727e0950",
      "name": "Vargas Ríos Sandra Vivíana",
      "homeroom": "702",
      "photo": "assets/photos/doc_74727e0950.webp",
      "assignments": [
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "801",
          "area": "Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia",
          "subject": "Cátedra de la Paz"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "702",
          "area": "Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia",
          "subject": "Cátedra de la Paz"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "602",
          "area": "Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia",
          "subject": "Cátedra de la Paz"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "601",
          "area": "Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia",
          "subject": "Cátedra de la Paz"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "701",
          "area": "Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia",
          "subject": "Cátedra de la Paz"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "802",
          "area": "Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia",
          "subject": "Cátedra de la Paz"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "601",
          "area": "Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia",
          "subject": "Ciencias Sociales y Competencias Ciudadanas"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "701",
          "area": "Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia",
          "subject": "Ciencias Sociales y Competencias Ciudadanas"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "802",
          "area": "Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia",
          "subject": "Ciencias Sociales y Competencias Ciudadanas"
        },
        {
          "gradeId": "8",
          "grade": "8°",
          "course": "801",
          "area": "Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia",
          "subject": "Ciencias Sociales y Competencias Ciudadanas"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "702",
          "area": "Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia",
          "subject": "Ciencias Sociales y Competencias Ciudadanas"
        },
        {
          "gradeId": "6",
          "grade": "6°",
          "course": "602",
          "area": "Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia",
          "subject": "Ciencias Sociales y Competencias Ciudadanas"
        },
        {
          "gradeId": "7",
          "grade": "7°",
          "course": "702",
          "area": "Convivencia",
          "subject": "Convivencia"
        }
      ]
    }
  ],
  "dimensions": [
    {
      "id": "profesor",
      "name": "El profesor",
      "description": "Cómo organiza, desarrolla y evalúa el curso."
    },
    {
      "id": "clases",
      "name": "Las clases",
      "description": "Cómo son tus clases en general."
    }
  ],
  "questions": [
    {
      "id": "q1",
      "dimension": "profesor",
      "text": "El profesor entregó el programa de la asignatura al inicio del periodo (parcelación en la plataforma)."
    },
    {
      "id": "q2",
      "dimension": "profesor",
      "text": "Presenta los temas con claridad."
    },
    {
      "id": "q3",
      "dimension": "profesor",
      "text": "Comunica claramente los objetivos de cada clase."
    },
    {
      "id": "q4",
      "dimension": "profesor",
      "text": "Responde las dudas de los estudiantes en clase."
    },
    {
      "id": "q5",
      "dimension": "profesor",
      "text": "Expresa expectativas positivas de los estudiantes."
    },
    {
      "id": "q6",
      "dimension": "profesor",
      "text": "Explica los criterios de evaluación de la asignatura."
    },
    {
      "id": "q7",
      "dimension": "profesor",
      "text": "Evalúa adecuadamente la asignatura."
    },
    {
      "id": "q8",
      "dimension": "profesor",
      "text": "Programa y coordina actividades con uso de la tecnología como complemento a la asignatura."
    },
    {
      "id": "q9",
      "dimension": "profesor",
      "text": "Atiende dudas académicas de los estudiantes fuera de clase."
    },
    {
      "id": "q10",
      "dimension": "profesor",
      "text": "Realiza actividades de recuperación y refuerzo con estudiantes que lo necesitan."
    },
    {
      "id": "q11",
      "dimension": "profesor",
      "text": "Indica normas de comportamiento en clase claras para todos."
    },
    {
      "id": "q12",
      "dimension": "profesor",
      "text": "Es respetado por todos los estudiantes del curso."
    },
    {
      "id": "q13",
      "dimension": "profesor",
      "text": "Realiza clases activas y dinámicas."
    },
    {
      "id": "q14",
      "dimension": "profesor",
      "text": "Informa a padres de familia y acudientes sobre el desempeño de los estudiantes."
    },
    {
      "id": "q15",
      "dimension": "profesor",
      "text": "Llega puntual a clase y sus orientaciones son seguidas por todos los estudiantes."
    },
    {
      "id": "q16",
      "dimension": "clases",
      "text": "Son interesantes porque tratan temas llamativos."
    },
    {
      "id": "q17",
      "dimension": "clases",
      "text": "Empiezan y terminan a la hora indicada."
    },
    {
      "id": "q18",
      "dimension": "clases",
      "text": "Desarrollan los temas propuestos en el tiempo indicado."
    },
    {
      "id": "q19",
      "dimension": "clases",
      "text": "Tratan temas importantes para el barrio, la zona o la comunidad."
    },
    {
      "id": "q20",
      "dimension": "clases",
      "text": "¿Quisieras que el docente continúe el próximo año brindándote clase?"
    }
  ],
  "resources": {
    "title": "¿Cuáles de los siguientes recursos usa el profesor para desarrollar sus clases?",
    "hint": "Puedes marcar más de uno.",
    "options": [
      {
        "id": "tablero",
        "label": "Tablero"
      },
      {
        "id": "videos",
        "label": "Películas y videos"
      },
      {
        "id": "graficos",
        "label": "Láminas, mapas y otros materiales gráficos"
      },
      {
        "id": "computadores",
        "label": "Computadores"
      }
    ]
  }
};
