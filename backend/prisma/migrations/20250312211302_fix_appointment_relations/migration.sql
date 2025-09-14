-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL
);

-- Insert default admin user
INSERT INTO "User" ("id", "name", "email", "password", "role")
VALUES (
    'admin-0001',
    'Admin',
    'admin@example.com',
    'admin123', -- bcrypt hash for 'admin123'
    'admin'
);

INSERT INTO "User" ("id", "name", "email", "password", "role")
VALUES (
    'doctor-0001',
    'Doctor',
    'doctor@example.com',
    'doctor123', -- bcrypt hash for 'admin123'
    'doctor'
);
-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");