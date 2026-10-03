export const PRODUCTS = {
  "servora": {
    "accent": "#58bfc3",
    "currency": "IDR",
    "tagline": "Every booking. Every team. One operation.",
    "modules": [
      {
        "key": "customers",
        "label": "Pelanggan",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "email",
            "label": "Email",
            "type": "email"
          },
          {
            "key": "phone",
            "label": "Nomor telepon",
            "type": "text"
          },
          {
            "key": "address",
            "label": "Alamat",
            "type": "textarea"
          }
        ],
        "statuses": [
          "active",
          "archived"
        ]
      },
      {
        "key": "services",
        "label": "Layanan",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "price",
            "label": "Tarif",
            "type": "money"
          },
          {
            "key": "minutes",
            "label": "Durasi menit",
            "type": "number",
            "min": 1
          },
          {
            "key": "notes",
            "label": "Catatan",
            "type": "textarea"
          }
        ],
        "statuses": [
          "active",
          "archived"
        ]
      },
      {
        "key": "technicians",
        "label": "Teknisi",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "email",
            "label": "Email",
            "type": "email"
          },
          {
            "key": "phone",
            "label": "Nomor telepon",
            "type": "text"
          },
          {
            "key": "skills",
            "label": "Keahlian",
            "type": "text"
          }
        ],
        "statuses": [
          "active",
          "archived"
        ]
      },
      {
        "key": "vehicles",
        "label": "Kendaraan",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "plate",
            "label": "Nomor polisi",
            "type": "text",
            "required": true
          },
          {
            "key": "mileage",
            "label": "Odometer km",
            "type": "number",
            "min": 0
          },
          {
            "key": "notes",
            "label": "Catatan",
            "type": "textarea"
          }
        ],
        "statuses": [
          "active",
          "archived"
        ]
      },
      {
        "key": "bookings",
        "label": "Booking",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "customer_id",
            "label": "Pelanggan",
            "type": "ref",
            "ref": "customers",
            "required": true
          },
          {
            "key": "service_id",
            "label": "Layanan",
            "type": "ref",
            "ref": "services",
            "required": true
          },
          {
            "key": "technician_id",
            "label": "Teknisi",
            "type": "ref",
            "ref": "technicians",
            "required": true
          },
          {
            "key": "start",
            "label": "Mulai",
            "type": "datetime",
            "required": true
          },
          {
            "key": "end",
            "label": "Selesai",
            "type": "datetime",
            "required": true
          },
          {
            "key": "notes",
            "label": "Catatan",
            "type": "textarea"
          }
        ],
        "statuses": [
          "confirmed",
          "in_progress",
          "done",
          "cancelled"
        ],
        "actions": [
          "booking-job"
        ]
      },
      {
        "key": "jobs",
        "label": "Pekerjaan",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "booking_id",
            "label": "Booking",
            "type": "ref",
            "ref": "bookings",
            "required": false
          },
          {
            "key": "technician_id",
            "label": "Teknisi",
            "type": "ref",
            "ref": "technicians",
            "required": true
          },
          {
            "key": "vehicle_id",
            "label": "Kendaraan",
            "type": "ref",
            "ref": "vehicles",
            "required": false
          },
          {
            "key": "lat",
            "label": "Latitude",
            "type": "number",
            "min": -90,
            "max": 90
          },
          {
            "key": "lng",
            "label": "Longitude",
            "type": "number",
            "min": -180,
            "max": 180
          },
          {
            "key": "notes",
            "label": "Catatan",
            "type": "textarea"
          }
        ],
        "statuses": [
          "todo",
          "in_progress",
          "done"
        ]
      },
      {
        "key": "checklists",
        "label": "Checklist pekerjaan",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "job_id",
            "label": "Pekerjaan",
            "type": "ref",
            "ref": "jobs",
            "required": true
          },
          {
            "key": "steps",
            "label": "Daftar langkah",
            "type": "textarea"
          },
          {
            "key": "completed_steps",
            "label": "Langkah selesai",
            "type": "json"
          }
        ],
        "statuses": [
          "active",
          "done"
        ]
      },
      {
        "key": "expenses",
        "label": "Biaya",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "job_id",
            "label": "Pekerjaan",
            "type": "ref",
            "ref": "jobs",
            "required": false
          },
          {
            "key": "amount",
            "label": "Jumlah",
            "type": "money"
          },
          {
            "key": "date",
            "label": "Tanggal",
            "type": "date",
            "required": true
          },
          {
            "key": "notes",
            "label": "Catatan",
            "type": "textarea"
          }
        ],
        "statuses": [
          "active",
          "archived"
        ]
      },
      {
        "key": "mileage",
        "label": "Catatan jarak",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "vehicle_id",
            "label": "Kendaraan",
            "type": "ref",
            "ref": "vehicles",
            "required": true
          },
          {
            "key": "date",
            "label": "Tanggal",
            "type": "date",
            "required": true
          },
          {
            "key": "distance",
            "label": "Jarak km",
            "type": "number",
            "min": 0
          },
          {
            "key": "fuel",
            "label": "Bahan bakar liter",
            "type": "number",
            "min": 0
          }
        ],
        "statuses": [
          "active",
          "archived"
        ]
      },
      {
        "key": "route-planner",
        "label": "Rencana rute",
        "tool": "routes",
        "fields": []
      },
      {
        "key": "calendar",
        "label": "Jadwal tim",
        "tool": "calendar",
        "fields": []
      },
      {
        "key": "reports",
        "label": "Laporan",
        "tool": "reports",
        "fields": [],
        "statuses": []
      }
    ],
    "id": "servora",
    "name": "Servora Operations",
    "purpose": "Operasi layanan dengan pemesanan, teknisi, pekerjaan lapangan dan kendaraan dalam satu jadwal.",
    "sources": [
      "servora",
      "bookflow",
      "fieldroute-os",
      "fleetmile"
    ],
    "workflow": "Pelanggan → booking tanpa bentrok → pekerjaan + teknisi/kendaraan → checklist lapangan → selesai → biaya/jarak dan laporan operasional."
  }
};
