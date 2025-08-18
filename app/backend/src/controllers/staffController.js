const Staff = require('../models/Staff');
const { Op } = require('sequelize'); // Assuming you are using Sequelize ORM

exports.createStaff = async (req, res) => {
    const { name, phone, branch } = req.body;

    try {
        const staff = await Staff.create({ name, phone, branch });
        res.status(201).json({ message: 'Staff created', staff });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStaffs = async (req, res) => {
    try {
        const staffs = await Staff.findAll();
        res.json(staffs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteStaff = async (req, res) => {
    const { id } = req.params;
    try {
        await Staff.destroy({ where: { id } });
        res.json({ message: 'Staff deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.searchStaffByPhone = async (req, res) => {
    const { phone } = req.params;

    try {
        const staffs = await Staff.findAll({
            where: {
                phone: {
                    [Op.like]: `%${phone}%`
                }
            }
        });
        res.json(staffs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
