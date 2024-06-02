"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const zod = require('zod');
const client_1 = require("@prisma/client");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const prisma = new client_1.PrismaClient();
const signupBody = zod.object({
    username: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string()
});
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success } = signupBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            message: "Email already taken/incorrect inputs"
        });
    }
    const existingUser = yield prisma.user.findFirst({
        where: { username: req.body.username }
    });
    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken/Incorrect inputs"
        });
    }
    const user = yield prisma.user.create({
        data: {
            username: req.body.username,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        }
    });
    res.json({
        message: "User created Successfully"
    });
    const userID = user.id;
    const token = jwt.sign({ userID }, JWT_SECRET);
    // localStorage.setItem('userToken', token);
}));
const signinBody = zod.object({
    username: zod.string().email(),
    password: zod.string()
});
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success } = signinBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            message: "Incorrect Inputs"
        });
    }
    const user = yield prisma.user.findFirst({
        where: { username: req.body.username,
            password: req.body.password }
    });
    if (user) {
        res.json({
            message: "successfully login"
        });
        return;
    }
    res.status(411).json({
        message: "Error while logging in"
    });
}));
router.get("/data", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const value = localStorage.getItem('userToken');
    const userID = jwt.verify(value, JWT_SECRET);
    const todos = yield prisma.todo.findMany({
        where: {
            OR: [
                {
                    done: false
                },
                {
                    user_id: {
                        equals: userID,
                    },
                },
            ]
        }
    });
    res.json({
        todo: todos.map(todo => ({
            title: todo.title,
            description: todo.description,
            done: todo.done
        }))
    });
}));
module.exports = router;
