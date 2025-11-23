const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { Organisation, User } = db;
const { createLog } = require('./utils/logUtil');

exports.registerOrganisation = async (req, res) => {
    const { orgName, adminName, email, password } = req.body;
    if (!orgName || !adminName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        const t = await db.sequelize.transaction();

        try {
            const organisation = await Organisation.create({ name: orgName }, { transaction: t });
            const password_hash = await bcrypt.hash(password, 10);
            const user = await User.create({
                organisation_id: organisation.id,
                email,
                password_hash,
                name: adminName,
            }, { transaction: t });

            const token = jwt.sign(
                { userId: user.id, orgId: organisation.id },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );

            await createLog(organisation.id, user.id, 'organisation_created', { orgId: organisation.id, orgName });
            await createLog(organisation.id, user.id, 'user_registered_admin', { userId: user.id, email });

            await t.commit();
            return res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, orgId: organisation.id } });

        } catch (error) {
            await t.rollback();
            throw error;
        }

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Server error during registration.' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { userId: user.id, orgId: user.organisation_id },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        await createLog(user.organisation_id, user.id, 'user_logged_in', { userId: user.id, email });

        return res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email, orgId: user.organisation_id } });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Server error during login.' });
    }
};