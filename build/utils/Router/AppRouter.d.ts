import express from 'express';
export default class AppRouter {
    private static instance;
    static getInstance(): express.Router;
}
