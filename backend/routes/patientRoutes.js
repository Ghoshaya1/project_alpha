const express = require('express');
const prisma = require('../prismaClient');
const authMiddleware = require('../middlewares/authMiddleware');
const { message } = require('statuses');

const router = express.Router();

router.post('/', authMiddleware(['doctor']), async (req, res) => {
    const { name, age, medicalHistory, insuranceDetails } = req.body;

    try {
        const patient = await prisma.patient.create({
            data: {
                name,
                age,
                medicalHistory,
                insuranceDetails,
                doctorId: req.user.userId,
            },
        });

        res.status(201).json({message: 'patient created', patient});
    } catch (error) {
        res.status(400).json({ error: 'Error creating patient' });
    }
});

router.get('/:id', authMiddleware(['doctor','patient']), async (req, res) => {
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

router.delete('/:id', authMiddleware(['doctor']), async (req, res) => {
    try {
        const patient = await prisma.patient.delete({
            where: { id: req.params.id },
        });

        res.json({ message: 'Patient deleted', patient });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete patient' });
    }
});
module.exports = router;