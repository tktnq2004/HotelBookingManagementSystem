import Joi from "joi";

export const registerSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),

    phone: Joi.string()
        .pattern(/^[0-9]{9,11}$/)
        .required(),

    email: Joi.string().email().lowercase().required(),

    password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});