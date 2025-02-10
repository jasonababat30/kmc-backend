require('dotenv').config()

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user');

const { JWT_PRIVATE_KEY } = process.env;

const userController = {
    getAllUsers: async (req, res) => {
        // res.send("Get ALL Users using User Controller")
        try {
            const users = await User.find();
            res.json({
                data: users
            });
        } catch (error) {
            console.error('🦝 Error @ Get All Users: ', error);
            res.status(500).json({ message: error.message })
        }
    },
    getSpecificUser: async (req, res) => {
        try {
            const userId = req.params.id;

            const user = await User.findById(userId).populate("contacts");

            res.json({
                data: user
            });
        } catch (error) {
            console.error('🦝 Error @ Get Specific User: ', error);
            res.status(500).json({ message: error.message });
        }
    },
    createUser: async (req, res) => {
        try {
            const { password } = req.body;

            const user = new User({
                ...req.body
            });

            if (!password) throw new Error("Password is required");

            const hashedPassword = await bcrypt.hash(password, 10);

            user.password = hashedPassword;

            const newUser = await user.save();

            res.status(201).json({
                message: "Created Successfully",
                data: newUser
            });
        } catch (error) {
            console.error('🦝 Error @ Create User: ', error);
            res.status(400).json({ message: error.message });
        }
    },
    updateUser: async (req, res) => {
        const userId = req.params.id;
        const patchBody = req.body;

        try {
            // const user = await User.findById(userId).populate("contacts");
            const user = await User.findById(userId).populate("contacts");

            Object.entries(patchBody)
                .forEach(([key, value]) => {
                    if (key === 'contacts') {
                        user[key] = [
                            ...user[key],
                            ...value
                        ]

                        return;
                    }
                    user[key] = value
                });

            await user.save();

            res.json({
                message: "Updated Successfully",
                data: user
            });
        } catch (error) {
            console.error('🦝 Error @ Update User: ', error);
            res.status(500).json({ message: error.message });
        }
    },
    deleteUser: async (req, res) => {
        try {
            const currentUser = res.currentUser;
            const userId = req.params.id;

            if (!userId) throw new Error("ID is required");

            const foundUser = await User.findById(userId);

            switch (currentUser.role) {
                case 'super_admin':
                    const superAdminDeletionResult = await User.findByIdAndDelete(userId);

                    console.info("Deletion Result: ", superAdminDeletionResult)

                    res.json({
                        data: userId,
                        message: "Deleted Successfully"
                    })

                    break;

                case 'admin':
                    if (foundUser.role === 'super_admin' || currentUser.role === foundUser.role) throw new Error("Unauthorized deletion");

                    const adminDeletionResult = await User.findByIdAndDelete(userId);

                    console.info("Deletion Result: ", adminDeletionResult)

                    res.json({
                        data: userId,
                        message: "Deleted Successfully"
                    })

                    break;

                default:
                    throw new Error("Unauthorize deletion")
            }
        } catch (error) {
            console.error('🦝 Error @ Delete User: ', error);
            res.status(500).json({ message: error.message });
        }
    },

    signIn: async (req, res) => {
        try {
            const { emailAddress, password } = req.body;

            if (!emailAddress) throw new Error("Email Address is required")
            if (!password) throw new Error("Password is required")

            const foundUser = await User.findOne({
                emailAddress
            });

            if (!foundUser) throw new Error("User not found");

            const {
                password: hashedPassword,
                firstName,
                lastName,
                contactNumber,
                role
            } = foundUser;

            const isPasswordRight = await bcrypt.compare(password, hashedPassword);

            if (!isPasswordRight) throw new Error("Password is incorrect");

            const token = jwt.sign(
                {
                    firstName,
                    lastName,
                    emailAddress,
                    contactNumber,
                    role
                },
                JWT_PRIVATE_KEY,
            );

            res.json({ token })
        } catch (error) {
            console.error('🦝 Error @ Sign In: ', error);
            res.status(500).json({ message: error.message });
        }
    },


    // Middlewares
    deleteMiddleWare: async (req, res, next) => {
        try {
            const { authorization } = req.headers;

            if (!authorization) throw new Error("Token is required");

            const token = authorization.split(" ")[1];

            const currentUser = jwt.verify(token, JWT_PRIVATE_KEY)

            if (currentUser.role === 'super_admin' || currentUser.role === 'admin') {
                console.info(`User with role "${currentUser.role}" is authorized`);

                res.currentUser = currentUser;
                next();
                return;
            }

            throw new Error("User is not authorized");
        } catch (error) {
            console.error('🦝 Error @ Delete Middleware: ', error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = userController