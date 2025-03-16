const express = require('express');
const prisma = require('../prismaClient');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Get all users (Admin only)
router.get('/', authMiddleware(['admin']), async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Get current user info
router.get('/me', authMiddleware(), async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  res.json(user);
});

// Get all patients under a specific doctor
router.get('/my-patients', authMiddleware(['doctor']), async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      where: { doctorId: req.user.userId },
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get a patient’s details (Doctor or Patient themselves)
router.get('/patient/:id', authMiddleware(['doctor', 'patient']), async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
    });

    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    if (req.user.role === 'patient' && req.user.userId !== patient.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient details' });
  }
});

module.exports = router;
