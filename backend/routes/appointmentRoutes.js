const express = require('express');
const prisma = require('../prismaClient');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Book an appointment (Doctor or Patient)
router.post('/', authMiddleware(['doctor', 'patient']), async (req, res) => {
  const { doctorId, patientId, date } = req.body;

  try {
    const appointment = await prisma.appointment.create({
      data: { doctorId, patientId, date: new Date(date) },
    });

    res.status(201).json({ message: 'Appointment booked', appointment });
  } catch (error) {
    res.status(400).json({ error: 'Error booking appointment' });
  }
});

// Get all appointments (Admin & Doctor)
router.get('/', authMiddleware(['admin', 'doctor']), async (req, res) => {
  const appointments = await prisma.appointment.findMany({
    include: { doctor: true, patient: true },
  });
  res.json(appointments);
});

// Get personal appointments (Patients)
router.get('/my', authMiddleware(['patient']), async (req, res) => {
  const appointments = await prisma.appointment.findMany({
    where: { patientId: req.user.userId },
    include: { doctor: true },
  });
  res.json(appointments);
});

// Update appointment status (Doctor only)
router.put('/:id/status', authMiddleware(['doctor']), async (req, res) => {
  const { status } = req.body;

  try {
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json({ message: 'Appointment status updated', appointment });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update appointment' });
  }
});

module.exports = router;
