-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "medicalHistory" TEXT,
    "insuranceDetails" TEXT,
    "doctorId" TEXT,
    CONSTRAINT "Patient_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
